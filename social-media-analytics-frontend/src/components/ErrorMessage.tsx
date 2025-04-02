import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ErrorMessageProps {
  message: string | null | undefined;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <strong className="font-bold mr-2">
                <FaExclamationTriangle className="inline-block align-middle mr-1" />
                Error:
            </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

export default ErrorMessage;