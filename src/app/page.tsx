import styles from "./page.module.css";
import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hesap Makinesi</h1>
          <p className={styles.subtitle}>
            Basit ve hızlı matematiksel işlemler için modern arayüz.
          </p>
        </div>
        <Calculator />
        <p className={styles.helper}>
          Çarpma için ×, bölme için ÷ tuşlarını kullanın. Yüzde ve işaret değiştirme
          tuşları günlük hesaplamalarda yardımcı olur.
        </p>
      </main>
    </div>
  );
}
