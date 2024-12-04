import Link from "next/link";
import { useRouter } from "next/router"; // Importando o useRouter para redirecionar após o logout

export default function NavAdmin() {
    const router = useRouter(); // Hook para redirecionamento

    // Função de logout
    const handleLogout = () => {
        // Remover o token do localStorage ou sessionStorage (depende de onde você o armazena)
        localStorage.removeItem("token"); // Se estiver usando localStorage
        // sessionStorage.removeItem("token"); // Se estiver usando sessionStorage

        // Redirecionar para a página de login
        router.push("/");
    };

    return (
        <nav
            className="navbar navbar-light p-3"
            style={{
                background: "linear-gradient(90deg, #155724, #28a745)", // Verde escuro para verde menos escuro
                color: "white",
            }}
        >
            <div className="d-flex align-items-center">
                <img
                    src="/image/logo-apae.png"
                    alt="Logo APAE"
                    className="me-3"
                    style={{ width: '50px', height: '50px' }}
                />
                <h2 className="navbar-brand mb-0 text-white">APAE</h2>
            </div>
            <div className="d-flex">
                <button
                    onClick={handleLogout} // Chama a função de logout ao clicar
                    className="btn btn-light text-success"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

