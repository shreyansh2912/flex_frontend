export interface IUser {
    _id: string;
    name: string;
    email: string;
}

export interface IWordData {
    text: string;
    value: number;
}

export interface IUserProfile {
    name: string;
    email: string;
    profileImage: string;
    qrColor: string;
}

export interface IForm {
    _id: string;
    title: string;
    formType: string;
    visibility?: 'public' | 'password-protected';
    password?: string;
    allowedEmails?: string[];
    collectUserInfo?: boolean;
    fields?: FormField[];
    theme?: FormTheme;
    submitButtonText?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface FormField {
    id: number;
    label: string;
    name: string;
    type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'image';
    placeholder?: string;
    options?: string[];
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
    layout?: {
        width: string;
    };
    page?: number;
    logic?: FormLogic;
    sequence?: number;
}

export interface FormLogic {
    action: 'show' | 'hide';
    when: string;
    equals: string;
}

export interface FormTheme {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
}

export interface ISession {
    _id: string;
    status: string;
    createdAt: string;
    timeLimit?: number;
    words?: any[];
    question?: string; // For Polls
    questions?: any[]; // For QnA
    type?: 'wordcloud' | 'poll' | 'qna'; // Optional discriminator if needed
}

export interface IPoll {
    _id: string;
    question: string;
    status: string;
    createdAt: string;
    options: { text: string; count: number }[];
}

export interface IQuestion {
    _id: string;
    text: string;
    upvotes: number;
    upvotedBy?: string[];
    isAnswered: boolean;
    createdAt: string;
}

export interface IQnA {
    _id: string;
    status: string;
    createdAt: string;
    questions: IQuestion[];
}

export interface IQnASession {
    _id: string;
    hostId: string;
    questions: IQuestion[];
    status: 'active' | 'completed';
}
