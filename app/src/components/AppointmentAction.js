import Link from "next/link";
import handleDeleteAgendamento from "@/pages/admin/agendamentos/delete/[pid]";

export default function AppointmentAction(props) {
    return (
        <>
            <Link className="btn btn-outline-primary btn-sm" href={`/admin/agendamentos/update/${ props.pid }`}>Editar</Link>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteAgendamento(props.pid)}>Deletar</button>
        </>
    )
}
