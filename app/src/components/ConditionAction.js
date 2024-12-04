import Link from "next/link";
import handleDeleteCondition from "@/pages/admin/condicoes/delete/[pid]";

export default function ConditionAction(props) {
    return (
        <>
            <Link className="btn btn-outline-primary btn-sm" href={`/admin/condicoes/update/${ props.pid }`}>Editar</Link>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteCondition(props.pid)}>Deletar</button>
        </>
    )
}
