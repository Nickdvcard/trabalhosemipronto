import Link from "next/link";
import styles from "../styles/navhome.module.css";

export default function NavHome() {
    return (
        <>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navbarBrand}>
                    <h2>Agenda APAE</h2>
                </div>
                <div className="form-group">
                    <Link className={styles.btnSuccess} href="/login">Login</Link>
                </div>
            </nav>

            {/* Mensagem acima dos cards */}
            <div className={styles.messageContainer}>
                <h3 className={styles.mainMessage}>Eventos APAE</h3>
            </div>

            {/* Container de Cards */}
            <div className={styles.cardContainer}>
                {/* Primeiro Card */}
                <div className={styles.card}>
                    <div className={`${styles.cardImage} ${styles.cardImage1}`}></div>
                    
                    <p>O Dia do Idoso, tem como objetivo, valorizar e respeitar a terceira idade.</p>
                </div>

                {/* Segundo Card */}
                <div className={styles.card}>
                    <div className={`${styles.cardImage} ${styles.cardImage2}`}></div>
                    
                    <p>Dia de parabenizar as secretárias, que nos auxiliam de diversas maneiras e com muito carinho.</p>
                </div>

                {/* Terceiro Card */}
                <div className={styles.card}>
                    <div className={`${styles.cardImage} ${styles.cardImage3}`}></div>
                    <p>Importante lembrar deste dia, para nos consientizarmos e promover os direitos das pessoas com deficiências.</p>
                </div>
            </div>
        </>
    );
}
