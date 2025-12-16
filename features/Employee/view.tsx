import { getEmployeeById } from '@/service/employee';
import { IEmployee } from '@/models/employee';
import EmployeeForm from './formwithoutpass';

type TEmployeeViewPageProps = {
  id: string;
};

export default async function EmployeeViewPage({ id }: TEmployeeViewPageProps) {
  let employee: IEmployee | null = null;
  let pageTitle = 'Create New Employee';

  if (id !== 'new') {
    try {
      const response = await getEmployeeById(id);
      employee = response || null;

      if (!employee) {
      }

      pageTitle = `Edit Employee`;
    } catch  {}
  }

  return <EmployeeForm initialData={employee} pageTitle={pageTitle} />;
}
