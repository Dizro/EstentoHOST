"use server";

import {Link, localePrefix} from '@/navigation';
import { Button } from "@/components/ui/button";
import {getLocale, getTranslations} from 'next-intl/server';

import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
  Languages,
  Menu,
  SlidersHorizontal,
  BotIcon,
  PenIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import Image from 'next/image';

import logo from '../../../public/logo.svg';

import { getKindeServerSession, LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import MessageForm from '@/components/ui/MessageForm';
import QuesionPage from '@/components/ui/QuestionPage';
import Title from '@/components/ui/title';
// import MessageForm from '@/components/MessageForm';
import ChatSideBar from "@/components/ui/ChatSideBar";
import RaspisanieTPU from "@/components/ui/tpu_raspisanie";

export default async function HomePage() {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();
    const locale = await getLocale();
    const chatId = '';
    const t = await getTranslations("Main");
    const translations = {
        contacts: t("contacts"),
        developer: t("developer"),
        chat_history: t("chat_history"),
        please_log_in: t("please_log_in"),
        no_chats: t("no_chats"),

        inverted_index: t("inverted_index"),
        keyword_matching: t("keyword_matching"),
        semantic_ranking: t("semantic_ranking"),
        nlp_usage: t("nlp_usage"),
        vector_search: t("vector_search"),
        complex_query_processing: t("complex_query_processing"),
        performance_optimization: t("performance_optimization"),
        fast_query_processing: t("fast_query_processing"),
    };

    const _chats = user ? await db.select().from(chats).where(eq(chats.userId, user.id)) : [];

    return (
        <>
            <div className="grid md:grid-cols-[260px_1fr] h-screen">
                <ChatSideBar chats={_chats} locale={locale} chatId={chatId} isAuthenticated={!!user} showBackIcon={false} translations={translations} />
                <div className="flex flex-col flex-1">
                    <Header />
                    <MainContent />
                </div>
            </div>
            {/* <RaspisanieTPU /> */}
        </>
    );
};





export async function Header() {
    const t = await getTranslations("Main");
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();    
    return (
        <div className="hidden md:flex justify-end items-center p-4 w-full">
            {isAuthed ? (
                <>
                    <div className="flex items-center mr-2">
                        <Avatar className="mr-2">
                            <AvatarImage src={user?.picture ? user.picture : "https://github.com/shadcn.png"} alt="@estentoai" />
                            <AvatarFallback>{user?.given_name ? user.given_name.slice(0, 1) : "User"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold">{user?.given_name}</span>
                            <span className="text-xs text-gray-500">{user?.email}</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="flex items-center justify-center h-8 w-8 mr-2">
                                <Languages className="h-3.5 w-3.5" />
                                <span className="sr-only">{t("lang")}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href="/" locale="en">
                                <DropdownMenuItem>
                                    English (English)
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/" locale="ru">
                                <DropdownMenuItem>
                                    Russian (Русский)
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/" locale="zh">
                                <DropdownMenuItem>
                                    Simplified Chinese (简体中文)
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="flex items-center justify-center h-8 w-8 mr-2">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                <span className="sr-only">{t("lang")}</span> 
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <LogoutLink>
                                <DropdownMenuItem>
                                    {t("log-out")}
                                </DropdownMenuItem>
                            </LogoutLink>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="flex items-center justify-center h-8 w-8 mr-2">
                                <Languages className="h-3.5 w-3.5" />
                                <span className="sr-only">{t("lang")}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href="/" locale="en">
                                <DropdownMenuItem>
                                    English (English)
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/" locale="ru">
                                <DropdownMenuItem>
                                    Russian (Русский)
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/" locale="zh">
                                <DropdownMenuItem>
                                    Simplified Chinese (简体中文)
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <LoginLink>
                        <Button className="mr-2">{t("log-in")}</Button>
                    </LoginLink>
                    <RegisterLink>
                        <Button>{t("create-an-account")}</Button>
                    </RegisterLink>
                </>
            )}
        </div>
    );
}

async function MainContent() {
    const t = await getTranslations("Main");
    const locale = await getLocale();
    const translations = {
        title: t("title"),
        titleTextarea: t("title-textarea"),
        titleSendMessage: t("title-send-message"),
        selectModel: t("select_model"),
        selectSource: t("select_source"),
        llama3Depiction: t("llama3_depiction"),
        gpt4oDepiction: t("gpt-4o_depiction"),
        mixtralDepiction: t("mixtral_depiction"),
        select_model_source_query: t("select_model_source_query"),
        enter_query_source: t("enter_query_source"),
        enter_query_model: t("enter_query_model"),
        select_model_source: t("select_model_source"),
        enter_query: t("enter_query"),
        select_model_only: t("select_model_only"),
    };
    return (
        <main className="flex flex-1 items-center mt-8 justify-center flex-col">
        <Link href="/" className='cursor-default'>
        <Image
            src={logo}
            alt='logo'
            loading="eager"
            priority={true}
            className='w-[190px] mb-5 fill-white'
        />
        </Link>
        <h2 className="text-[14px] mb-6 text-center">{translations.title}</h2>
        {/* <h2 className="mb-6 text-center"><Title /></h2> */}
        {/* -- ДЛЯ TYPE WRITE АНИМАЦИИ */}
        <MessageForm translations={translations} locale={locale}/>
        <FrequentlyAskedQuestions />
        <MobileNavigation />
        </main>
    );
}

async function FrequentlyAskedQuestions() {
    const t = await getTranslations("Main");
    const translations = {
        users_prompt: t("users-prompt"),
        query_one: t("main_query_three"),
        query_two: t("main_query_one"),
        query_three: t("main_query_two"),
    };
    return (
        <div><QuesionPage translations={translations}/></div>
    );
}


async function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-0 left-0 m-4 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-4">
        <NavigationLinks />
        {/* <UpgradeCard /> */}
      </SheetContent>
    </Sheet>
  );
}

async function NavigationLinks() {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();
    const t = await getTranslations("Main");
    return (
        <nav className="grid gap-2 text-lg font-medium">
        {/* Add actual hrefs in place of "#" */}
        <Link href="#" className="flex items-center justify-center gap-2 text-lg font-semibold">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline" className="flex items-center justify-center h-8 w-full mt-6 mr-2">
                            <Languages className="h-3.5 w-3.5" />
                            <span>{t("lang")}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link href="/en">
                            <DropdownMenuItem>
                                English (English)
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/ru">
                            <DropdownMenuItem>
                                Russian (Русский)
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/zh">
                            <DropdownMenuItem>
                                Simplified Chinese (简体中文)
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
                </Link>
                    {isAuthed ? (
                        <><div className="flex items-center justify-center">
                            <div className="flex items-center mr-2">
                                <Avatar className="mr-2">
                                    <AvatarImage src={user?.picture ? user.picture : "https://github.com/shadcn.png"} alt="@estentoai" />
                                    <AvatarFallback>{user?.given_name ? user.given_name.slice(0, 1) : "User"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{user?.given_name}</span>
                                    <span className="text-xs text-gray-500">{user?.email}</span>
                                </div>
                            </div>
                            <LogoutLink className="gap-2 text-xs font-semibold">
                                <Button className="">{t("log-out")}</Button>
                            </LogoutLink>
                        </div></>
                        ) : (
                        <><LoginLink className="flex items-center justify-center gap-2 text-lg font-semibold"><Button className="">{t("log-in")}</Button></LoginLink>
                        <RegisterLink className="flex items-center justify-center gap-2 text-lg font-semibold"><Button>{t("create-an-account")}</Button></RegisterLink></>
                    )}
        </nav>
    );
}

// async function UpgradeCard() {
//     const t = await getTranslations("Main");
//     return (
//         <Card>
//         <CardHeader>
//             <CardTitle>Upgrade to Pro</CardTitle>
//             <CardDescription>
//             Unlock all features and get unlimited access to our support team.
//             </CardDescription>
//         </CardHeader>
//         <CardContent>
//             <Button size="sm" className="w-full">
//             Upgrade
//             </Button>
//         </CardContent>
//         </Card>
//     );
// }