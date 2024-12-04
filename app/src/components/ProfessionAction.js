import Link from "next/link";
import handleDeleteProfession from "@/pages/admin/profissoes/delete/[pid]";

export default function ProfessionAction(props) {
    return (
        <>
            <Link className="btn btn-outline-primary btn-sm" href={`/admin/profissoes/update/${props.pid}`}>Editar</Link>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProfession(props.pid)}>Deletar</button>
        </>
    )
}
