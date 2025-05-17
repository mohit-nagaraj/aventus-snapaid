'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackButton = () => {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            aria-label="Go back"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    );
};

export default BackButton