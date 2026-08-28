import { AiModels } from "./aiModels";
import { createArticles } from "./articles";
import { userSeeders } from "./user";



async function main() {
    //await userSeeders();
    await AiModels();
    //await createArticles();
}

main();