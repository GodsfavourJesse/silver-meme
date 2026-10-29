import { AuthExperience } from "@/app/components/auth/AuthExperience";
import { RegistrationForm } from "@/app/components/auth/RegistrationForm";

export default function RegisterPage() {
    return (
        <AuthExperience mode="register">
            <RegistrationForm />
        </AuthExperience>
    );
}