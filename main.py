from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
from typing import Optional, List
import uuid
from datetime import datetime

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Bucket names for Supabase Storage
AVATAR_BUCKET = "avatars"
LOGO_BUCKET = "logos"

# -------- MODELS --------
class CityIn(BaseModel):
    name: str
    state: str

class CityUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None

class CategoryIn(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class ServiceIn(BaseModel):
    name: str
    description: Optional[str] = None
    city_id: int
    category_id: int

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    city_id: Optional[int] = None
    category_id: Optional[int] = None

class UserIn(BaseModel):
    name: str
    email: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

# -------- CITIES --------
@app.get("/cities")
def list_cities():
    return supabase.table("cities").select("*").execute().data

@app.get("/cities/{city_id}")
def get_city(city_id: int):
    res = supabase.table("cities").select("*").eq("id", city_id).execute()
    if not res.data:
        raise HTTPException(404, "Cidade não encontrada")
    return res.data[0]

@app.post("/cities")
def create_city(city: CityIn):
    res = supabase.table("cities").insert(city.dict()).execute()
    if not res.data:
        raise HTTPException(400, "Erro ao criar cidade")
    return res.data[0]

@app.put("/cities/{city_id}")
def update_city(city_id: int, city: CityUpdate):
    # Check if city exists
    existing = supabase.table("cities").select("id").eq("id", city_id).execute()
    if not existing.data:
        raise HTTPException(404, "Cidade não encontrada")
    
    # Update only provided fields
    update_data = {k: v for k, v in city.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nenhum dado para atualizar")
    
    res = supabase.table("cities").update(update_data).eq("id", city_id).execute()
    return res.data[0]

@app.delete("/cities/{city_id}")
def delete_city(city_id: int):
    # Check if city exists
    existing = supabase.table("cities").select("id").eq("id", city_id).execute()
    if not existing.data:
        raise HTTPException(404, "Cidade não encontrada")
    
    # Check if city is being used in services
    services = supabase.table("services").select("id").eq("city_id", city_id).execute()
    if services.data:
        raise HTTPException(400, "Não é possível deletar cidade pois está sendo usada em serviços")
    
    supabase.table("cities").delete().eq("id", city_id).execute()
    return {"message": "Cidade deletada com sucesso"}

# -------- CATEGORIES --------
@app.get("/categories")
def list_categories():
    return supabase.table("categories").select("*").execute().data

@app.get("/categories/{category_id}")
def get_category(category_id: int):
    res = supabase.table("categories").select("*").eq("id", category_id).execute()
    if not res.data:
        raise HTTPException(404, "Categoria não encontrada")
    return res.data[0]

@app.post("/categories")
def create_category(category: CategoryIn):
    res = supabase.table("categories").insert(category.dict()).execute()
    if not res.data:
        raise HTTPException(400, "Erro ao criar categoria")
    return res.data[0]

@app.put("/categories/{category_id}")
def update_category(category_id: int, category: CategoryUpdate):
    existing = supabase.table("categories").select("id").eq("id", category_id).execute()
    if not existing.data:
        raise HTTPException(404, "Categoria não encontrada")
    
    update_data = {k: v for k, v in category.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nenhum dado para atualizar")
    
    res = supabase.table("categories").update(update_data).eq("id", category_id).execute()
    return res.data[0]

@app.delete("/categories/{category_id}")
def delete_category(category_id: int):
    existing = supabase.table("categories").select("id").eq("id", category_id).execute()
    if not existing.data:
        raise HTTPException(404, "Categoria não encontrada")
    
    # Check if category is being used in services
    services = supabase.table("services").select("id").eq("category_id", category_id).execute()
    if services.data:
        raise HTTPException(400, "Não é possível deletar categoria pois está sendo usada em serviços")
    
    supabase.table("categories").delete().eq("id", category_id).execute()
    return {"message": "Categoria deletada com sucesso"}

# -------- USERS --------
@app.get("/users")
def list_users():
    return supabase.table("users").select("*").execute().data

@app.get("/users/{user_id}")
def get_user(user_id: int):
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(404, "Usuário não encontrado")
    return res.data[0]

@app.post("/users")
def create_user(user: UserIn):
    # Check if user already exists
    existing = supabase.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(400, "Email já cadastrado")
    
    res = supabase.table("users").insert(user.dict()).execute()
    if not res.data:
        raise HTTPException(400, "Erro ao criar usuário")
    return res.data[0]

@app.put("/users/{user_id}")
def update_user(user_id: int, user: UserUpdate):
    existing = supabase.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(404, "Usuário não encontrado")
    
    # If updating email, check if it's not taken by another user
    if user.email:
        email_check = supabase.table("users").select("id").eq("email", user.email).neq("id", user_id).execute()
        if email_check.data:
            raise HTTPException(400, "Email já está em uso por outro usuário")
    
    update_data = {k: v for k, v in user.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nenhum dado para atualizar")
    
    res = supabase.table("users").update(update_data).eq("id", user_id).execute()
    return res.data[0]

@app.post("/users/{user_id}/avatar")
async def upload_user_avatar(user_id: int, file: UploadFile = File(...)):
    # Check if user exists
    user = supabase.table("users").select("id, avatar_url").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(404, "Usuário não encontrado")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"user_{user_id}_{uuid.uuid4()}.{file_extension}"
    
    # Read file content
    content = await file.read()
    
    try:
        # Upload to Supabase Storage
        res = supabase.storage.from_(AVATAR_BUCKET).upload(unique_filename, content, {
            "content-type": file.content_type
        })
        
        # Get public URL
        public_url = supabase.storage.from_(AVATAR_BUCKET).get_public_url(unique_filename)
        
        # Update user record with avatar URL
        supabase.table("users").update({"avatar_url": public_url}).eq("id", user_id).execute()
        
        return {"avatar_url": public_url}
    except Exception as e:
        raise HTTPException(500, f"Erro ao fazer upload: {str(e)}")

@app.delete("/users/{user_id}/avatar")
def delete_user_avatar(user_id: int):
    # Check if user exists
    user = supabase.table("users").select("id, avatar_url").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(404, "Usuário não encontrado")
    
    avatar_url = user.data[0].get("avatar_url")
    if not avatar_url:
        raise HTTPException(400, "Usuário não possui avatar")
    
    # Extract filename from URL
    filename = avatar_url.split('/')[-1]
    
    try:
        # Delete from storage
        supabase.storage.from_(AVATAR_BUCKET).remove([filename])
        
        # Update user record
        supabase.table("users").update({"avatar_url": None}).eq("id", user_id).execute()
        
        return {"message": "Avatar deletado com sucesso"}
    except Exception as e:
        raise HTTPException(500, f"Erro ao deletar avatar: {str(e)}")

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    existing = supabase.table("users").select("id, avatar_url").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(404, "Usuário não encontrado")
    
    # Delete avatar if exists
    avatar_url = existing.data[0].get("avatar_url")
    if avatar_url:
        filename = avatar_url.split('/')[-1]
        try:
            supabase.storage.from_(AVATAR_BUCKET).remove([filename])
        except:
            pass  # Continue even if avatar deletion fails
    
    # Delete user
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"message": "Usuário deletado com sucesso"}

# -------- SERVICES --------
@app.get("/services")
def list_services(
    city_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None)
):
    query = supabase.table("services").select("*, cities(name, state), categories(name)")
    
    if city_id:
        query = query.eq("city_id", city_id)
    if category_id:
        query = query.eq("category_id", category_id)
    
    return query.execute().data

@app.get("/services/{service_id}")
def get_service(service_id: int):
    res = supabase.table("services").select("*, cities(name, state), categories(name)").eq("id", service_id).execute()
    if not res.data:
        raise HTTPException(404, "Serviço não encontrado")
    return res.data[0]

@app.post("/services")
def create_service(service: ServiceIn):
    # Check if city and category exist
    city = supabase.table("cities").select("id").eq("id", service.city_id).execute()
    if not city.data:
        raise HTTPException(400, "Cidade não encontrada")
    
    category = supabase.table("categories").select("id").eq("id", service.category_id).execute()
    if not category.data:
        raise HTTPException(400, "Categoria não encontrada")
    
    res = supabase.table("services").insert(service.dict()).execute()
    if not res.data:
        raise HTTPException(400, "Erro ao criar serviço")
    return res.data[0]

@app.put("/services/{service_id}")
def update_service(service_id: int, service: ServiceUpdate):
    existing = supabase.table("services").select("id").eq("id", service_id).execute()
    if not existing.data:
        raise HTTPException(404, "Serviço não encontrado")
    
    # Validate city and category if provided
    if service.city_id:
        city = supabase.table("cities").select("id").eq("id", service.city_id).execute()
        if not city.data:
            raise HTTPException(400, "Cidade não encontrada")
    
    if service.category_id:
        category = supabase.table("categories").select("id").eq("id", service.category_id).execute()
        if not category.data:
            raise HTTPException(400, "Categoria não encontrada")
    
    update_data = {k: v for k, v in service.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nenhum dado para atualizar")
    
    res = supabase.table("services").update(update_data).eq("id", service_id).execute()
    return res.data[0]

@app.post("/services/{service_id}/logo")
async def upload_service_logo(service_id: int, file: UploadFile = File(...)):
    # Check if service exists
    service = supabase.table("services").select("id, logo_url").eq("id", service_id).execute()
    if not service.data:
        raise HTTPException(404, "Serviço não encontrado")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"service_{service_id}_{uuid.uuid4()}.{file_extension}"
    
    # Read file content
    content = await file.read()
    
    try:
        # Upload to Supabase Storage
        res = supabase.storage.from_(LOGO_BUCKET).upload(unique_filename, content, {
            "content-type": file.content_type
        })
        
        # Get public URL
        public_url = supabase.storage.from_(LOGO_BUCKET).get_public_url(unique_filename)
        
        # Update service record with logo URL
        supabase.table("services").update({"logo_url": public_url}).eq("id", service_id).execute()
        
        return {"logo_url": public_url}
    except Exception as e:
        raise HTTPException(500, f"Erro ao fazer upload: {str(e)}")

@app.delete("/services/{service_id}/logo")
def delete_service_logo(service_id: int):
    # Check if service exists
    service = supabase.table("services").select("id, logo_url").eq("id", service_id).execute()
    if not service.data:
        raise HTTPException(404, "Serviço não encontrado")
    
    logo_url = service.data[0].get("logo_url")
    if not logo_url:
        raise HTTPException(400, "Serviço não possui logo")
    
    # Extract filename from URL
    filename = logo_url.split('/')[-1]
    
    try:
        # Delete from storage
        supabase.storage.from_(LOGO_BUCKET).remove([filename])
        
        # Update service record
        supabase.table("services").update({"logo_url": None}).eq("id", service_id).execute()
        
        return {"message": "Logo deletado com sucesso"}
    except Exception as e:
        raise HTTPException(500, f"Erro ao deletar logo: {str(e)}")

@app.delete("/services/{service_id}")
def delete_service(service_id: int):
    existing = supabase.table("services").select("id, logo_url").eq("id", service_id).execute()
    if not existing.data:
        raise HTTPException(404, "Serviço não encontrado")
    
    # Delete logo if exists
    logo_url = existing.data[0].get("logo_url")
    if logo_url:
        filename = logo_url.split('/')[-1]
        try:
            supabase.storage.from_(LOGO_BUCKET).remove([filename])
        except:
            pass  # Continue even if logo deletion fails
    
    # Delete service
    supabase.table("services").delete().eq("id", service_id).execute()
    return {"message": "Serviço deletado com sucesso"}

# Root endpoint
@app.get("/")
def root():
    return {"message": "API Manager Dashboard Backend", "status": "online"}