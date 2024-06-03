import { db } from "@/db/index";
import { title_ai_texts, NewText } from "@/db/schema";
import research from "./ai_generate_json";
const fs = require('fs').promises;

(async () => {
    try {

        console.log("Обновление запросов главной страницы.");
        const jsonData = await research("Новости технологий и науки в мире, Поиск работы, reddit.com");
        
        // const parsedData: NewText[] = jsonData.Text.map((item: any) => ({
        //     english: item.english,
        //     chinese: item.chinese,
        //     russian: item.russian,
        // }));        

        // await db.delete(title_ai_texts);

        // await db.insert(title_ai_texts).values(parsedData);
        // console.log("Добавлены 3 новых запроса для главного экрана.");

        // // Извлечение данных из базы данных
        // const retrievedData = await db.select().from(title_ai_texts);

        // // Чтение существующих файлов локализации
        // const enData = JSON.parse(await fs.readFile('messages/en.json', 'utf8'));
        // const ruData = JSON.parse(await fs.readFile('messages/ru.json', 'utf8'));
        // const zhData = JSON.parse(await fs.readFile('messages/zh.json', 'utf8'));

        // // Обновление JSON объектов
        // enData.Main.main_query_one = retrievedData[0].english;
        // enData.Main.main_query_two = retrievedData[1].english;
        // enData.Main.main_query_three = retrievedData[2].english;

        // ruData.Main.main_query_one = retrievedData[0].russian;
        // ruData.Main.main_query_two = retrievedData[1].russian;
        // ruData.Main.main_query_three = retrievedData[2].russian;

        // zhData.Main.main_query_one = retrievedData[0].chinese;
        // zhData.Main.main_query_two = retrievedData[1].chinese;
        // zhData.Main.main_query_three = retrievedData[2].chinese;

        // // Сохранение обновленных JSON объектов обратно в файлы локализации
        // await fs.writeFile('messages/en.json', JSON.stringify(enData, null, 2));
        // await fs.writeFile('messages/ru.json', JSON.stringify(ruData, null, 2));
        // await fs.writeFile('messages/zh.json', JSON.stringify(zhData, null, 2));

        // console.log("Файлы локализации обновлены.");

    } catch (error) {
        console.error("Ошибка при выполнении загрузки файлов в базу данных:", error);
    }
})();