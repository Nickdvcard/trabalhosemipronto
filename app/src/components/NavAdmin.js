import Link from "next/link";

export default function NavAdmin() {
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
                    src="/logo-apae.png" 
                    alt="Logo APAE" 
                    className="me-3" 
                    style={{ width: '50px', height: '50px' }}
                />
                <h2 className="navbar-brand mb-0 text-white">APAE</h2>
            </div>
            <div className="d-flex">
                <Link className="btn btn-light text-success" href="/">
                    Logout
                </Link>
            </div>
        </nav>
    );
}
