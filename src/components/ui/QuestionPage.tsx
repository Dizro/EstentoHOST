'use client';

import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
interface MessageFormProps {
    translations: {
        users_prompt: string;
        query_one: string;
        query_two: string;
        query_three: string;
    };
}

const QuesionPage: React.FC<MessageFormProps> = ({ translations }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="w-full text-center p-4 mt-4 hidden lg:flex sm:flex md:flex flex-col items-center ">
                <h2 className="text-xs mb-4">{translations.users_prompt}</h2>
                <Skeleton className="w-[150px] sm:w-[600px] h-[40px] mb-3" />
                <Skeleton className="w-[150px] sm:w-[600px] h-[40px] mb-3" />
                <Skeleton className="w-[150px] sm:w-[600px] h-[40px]" />
            </div>
        );
    }

    return (
        <div className="w-full text-center p-4 mt-4 hidden lg:flex sm:flex md:flex flex-col items-center">
            <h2 className="text-xs mb-4">{translations.users_prompt}</h2>
            <div className="w-full px-4 flex flex-col items-center relative">
                <Button className="mb-3 w-full sm:w-auto text-base sm:text-xs md:text-sm lg:text-base relative" variant="outline">
                    {translations.query_one}
                </Button>
                <Button className="mb-3 w-full sm:w-auto text-base sm:text-xs md:text-sm lg:text-base" variant="outline">
                    {translations.query_two}
                </Button>
                <Button className="w-full sm:w-auto text-base sm:text-xs md:text-sm lg:text-base" variant="outline">
                    {translations.query_three}
                </Button>
            </div>
        </div>
    );
};

export default QuesionPage;