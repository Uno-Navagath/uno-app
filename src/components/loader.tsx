import React from 'react';
import {Loader2} from "lucide-react";

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full p-10">
            <Loader2 className="animate-spin text-primary"/>
        </div>
    );
};

export default Loader;