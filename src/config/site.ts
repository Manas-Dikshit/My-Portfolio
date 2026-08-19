import { portfolioData } from "@/lib/portfolio-data";
import env from "./env";



export const siteConfig = {
    title: portfolioData.personal.name,
    description: portfolioData.personal.bio,
    url: env.NEXT_PUBLIC_APP_URL,
    twitter: portfolioData.social.instagram,
    linkedin: portfolioData.social.linkedin,
    github: portfolioData.social.github,
    telegram: "https://t.me/EternalVortex"

}

const emailCodes = [109,97,110,97,115,100,105,107,115,104,105,116,52,56,64,103,109,97,105,108,46,99,111,109];

export const getEmail = () => String.fromCharCode(...emailCodes);