export interface Sede {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
}

export interface Role {
    id: string;
    name: string;
    display_name: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role_id: string;
}

export interface Pipeline {
    id: string;
    name: string;
    sede_id: string;
    is_default: boolean;
    stages?: Stage[];
}

export interface Stage {
    id: string;
    pipeline_id: string;
    name: string;
    position: number;
    color: string;
    is_won: boolean;
    is_lost: boolean;
}

export interface Lead {
    id: string;
    pipeline_id: string;
    stage_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    program_interest_id?: string;
    source?: string;
    campaign?: string;
    score: number;
    assigned_to?: string;
    sede_id?: string;
    tags: string[];
    notes?: string;
    converted_at?: string;
    student_id?: string;
    created_at: string;
    updated_at: string;
}

export interface AcademicProgram {
    id: string;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    enrollment_price: number;
    billing_day: number;
}

export interface Cohort {
    id: string;
    program_id: string;
    program_name?: string;
    name: string;
    start_date: string;
    end_date?: string;
    is_active: boolean;
}

export interface Student {
    id: string;
    matricula?: string;
    document_id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    sede_id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED';
    enrollments?: Enrollment[];
    created_at: string;
}

export interface Enrollment {
    id: string;
    student_id: string;
    cohort_id: string;
    enrollment_date: string;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface LeadAttachment {
    id: string;
    lead_id: string;
    filename: string;
    original_name: string;
    mimetype?: string;
    size?: number;
    created_at: string;
}

export interface ChatConversation {
    id: string;
    external_id: string;
    source: 'whatsapp' | 'instagram' | 'web';
    lead_id?: string;
    first_name?: string;
    last_name?: string;
    status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
    metadata: any;
    last_message_at: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_type: 'lead' | 'user' | 'system';
    sender_id?: string;
    content: string;
    message_type: 'text' | 'image' | 'file';
    metadata: any;
    is_read: boolean;
    created_at: string;
}
