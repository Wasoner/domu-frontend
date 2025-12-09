import { useAppContext } from '../context';
import { AuthLayout } from '../layout';
import { VisitRegistrationPanel } from '../components';
import './ResidentVisits.css';

const ResidentVisits = () => {
  const { user } = useAppContext();

  return (
    <AuthLayout user={user}>
      <article className="resident-visits">
        <header className="resident-visits__intro">
          <p className="resident-visits__eyebrow">Visitas</p>
          <h1>Registro de visitas</h1>
          <p className="resident-visits__subtitle">
            Controla quién ingresa a tu comunidad y comparte la información con recepción para agilizar el ingreso.
          </p>
        </header>

        <VisitRegistrationPanel user={user} />
      </article>
    </AuthLayout>
  );
};

export default ResidentVisits;


