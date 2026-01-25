import { useParams } from 'react-router-dom';
import ApiPage from '../pages/ApiPage';
import PackagePage from '../pages/PackagePage';

const ApiRouter = ({ db }) => {
  const params = useParams();
  const path = params["*"];

  if (!db || !path) {
    return <PackagePage db={db} currentPkg="" />;
  }

  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const parts = cleanPath.split('/');

  const potentialClassName = parts[parts.length - 1];
  const potentialPackagePath = parts.slice(0, -1).join('.'); 

  const pkgData = db.packages.find(p => p.name === potentialPackagePath);
  const classData = pkgData?.items.find(i => i.id === potentialClassName);

  if (classData) {
    return <ApiPage db={db} pkg={potentialPackagePath} cls={potentialClassName} />;
  }

  const fullPackagePath = parts.join('.');
  return <PackagePage db={db} currentPkg={fullPackagePath} />;
};

export default ApiRouter;