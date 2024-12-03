import Link from "next/link";
import handleDeleteProfissional from "@/pages/admin/profissionais/delete/[pid]";

export default function ProfissionalAction(props) {
    return (
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary btn-sm" href={`/admin/profissionais/update/${props.pid}`}>Editar</Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProfissional(props.pid)}>Deletar</button>
            </div>
            <div>
                <Link className="btn btn-outline-success btn-sm" href={`/admin/agendamentos/index/${props.pid}`}>Visualizar Agenda</Link>
            </div>
        </div>
    )
}
