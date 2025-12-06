import { portfolioData } from "@/lib/portfolio-data";
import env from "./env";



export const siteConfig = {
    title: portfolioData.personal.name,
    description: portfolioData.personal.bio,
    url: env.NEXT_PUBLIC_APP_URL,
    twitter: portfolioData.social.instagram,
    linkedin: portfolioData.social.linkedin,
    github: portfolioData.social.github,
    email: portfolioData.contact.email,
    telegram: "https://t.me/EternalVortex"

}