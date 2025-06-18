import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {UserRole} from "@/generated/prisma";
const axios = require('axios').default;

export default async function AllSurveys() {
    const session = await auth();
    const role = session?.user.role

    try {
        const response = await axios.get('/api/surveys');
        console.log(response);
    } catch (error) {
        console.error(error);
    }

    if (!role || role !== UserRole.SURVEY_CREATOR) {
        redirect("/");
    }

    return;
}