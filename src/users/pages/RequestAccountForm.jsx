import { useParams } from "react-router-dom";
import TeacherRequestAccountForm from "./TeacherRequestAccountForm.tsx";
import StudentRequestAccountForm from "./StudentRequestAccountForm.tsx";

const RequestAccountForm = () => {
    const { accountType } = useParams();

    if (accountType === "teacher") {
        return <TeacherRequestAccountForm />;
    }
    return <StudentRequestAccountForm />;
};

export default RequestAccountForm;
