import { useParams } from "react-router-dom";
import TeacherRequestAccountForm from "./TeacherRequestAccountForm";
import StudentRequestAccountForm from "./StudentRequestAccountForm";

const RequestAccountForm = () => {
    const { accountType } = useParams();

    if (accountType === "teacher") {
        return <TeacherRequestAccountForm />;
    } else {
        return <StudentRequestAccountForm />;
    }
};

export default RequestAccountForm;
