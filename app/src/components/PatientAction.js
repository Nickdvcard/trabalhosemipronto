import Link from "next/link";
import handleDeletePaciente from "@/pages/admin/pacientes/delete/[pid]";

export default function PacienteAction(props) {
    return (
        <>
            <Link className="btn btn-outline-primary btn-sm" href={`/admin/pacientes/update/${ props.pid }`}>Editar</Link>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeletePaciente(props.pid)}>Deletar</button>
        </>
    )
}
