import Link from "next/link";

export default function MenuUsers() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light p-3">
            <div className="container-fluid">
                <div className="d-flex justify-content gap-4">
                    <Link className="nav-link active text-dark" href="/admin">
                        <strong>Admin</strong>
                    </Link>
                    <Link className="nav-link text-dark" href="/admin/users">
                        Usuários
                    </Link>
                    <Link className="nav-link text-dark" href="/admin/users/create">
                        Novo Usuário
                    </Link>
                    <Link className="nav-link text-dark" href="/admin/pacientes">
                        Pacientes
                    </Link>
                    <Link className="nav-link text-dark" href="/admin/profissionais">
                        Profissionais
                    </Link>
                </div>
            </div>
        </nav>
    );
}
