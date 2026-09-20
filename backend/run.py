import uvicorn
import os
import socket
from dotenv import load_dotenv

load_dotenv()

def is_port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return False
        except OSError:
            return True

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    
    if is_port_in_use(host, port):
        print(f"⚠️  Port {port} is already in use by another process or background service.")
        alt_port = 8001 if port == 8000 else port + 1
        print(f"💡 Trying alternate port http://{host}:{alt_port} ...")
        if not is_port_in_use(host, alt_port):
            port = alt_port
        else:
            print(f"❌ Both port {port} and {alt_port} are occupied. Please close existing processes or specify PORT in .env")

    print(f"🌿 Starting GreenGuide AI Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
