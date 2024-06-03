import { GigaChat } from 'gigachat-node';
import { IMessage } from 'gigachat-node/interfaces/message';

class Gigachat {
    private client: GigaChat | null = null;

    // Метод для создания токена и инициализации клиента
    async createToken(): Promise<void> {
        try {
            const client = new GigaChat(process.env.GIGACHAT_API_KEY as string);
            await client.createToken();
            this.client = client;
        } catch (error) {
            console.error("Error creating token:", error);
        }
    }

    // Метод для получения всех моделей
    async getModels(): Promise<any> {
        if (!this.client) {
            console.error("Client is not initialized.");
            return;
        }

        try {
            const response = await this.client.allModels();
            return response;
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    }

    // Метод для получения ответа на сообщение пользователя
    async getMessage(messages: IMessage[]): Promise<string | undefined> {
        if (!this.client) {
            console.error("Client is not initialized.");
            return;
        }

        try {
            const response = await this.client.completion({
                model: "GigaChat", // Укажите модель, если необходимо
                messages: messages
            });

            // Извлекаем строковое содержимое из объекта IMessage
            const gigaAnswer = response?.choices[0]?.message?.content;
            console.log(gigaAnswer);
            return gigaAnswer;
        } catch (error) {
            console.error("Error getting message:", error);
        }
    }
}