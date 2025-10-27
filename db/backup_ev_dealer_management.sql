--
-- PostgreSQL database dump
--

\restrict u2OhGxPOqgc9aR7pS4dmh3jkZLN7EDhhxrNQrBwWQc56D7S81O6HD9MzD6ni0IF

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_dealer_order_items_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_dealer_order_items_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_dealer_order_items_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    staff_id uuid,
    appointment_type character varying(50) DEFAULT 'consultation'::character varying,
    title character varying(255) NOT NULL,
    description text,
    appointment_date timestamp without time zone NOT NULL,
    duration_minutes integer DEFAULT 60,
    location character varying(255),
    status character varying(50) DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    variant_id integer
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments_backup (
    appointment_id uuid,
    customer_id uuid,
    staff_id uuid,
    appointment_type character varying(50),
    title character varying(255),
    description text,
    appointment_date timestamp without time zone,
    duration_minutes integer,
    location character varying(255),
    status character varying(50),
    notes text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.appointments_backup OWNER TO postgres;

--
-- Name: customer_debt_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_debt_report (
    customer_id uuid NOT NULL,
    active_installments bigint,
    customer_name character varying(255),
    email character varying(255),
    last_order_date date,
    outstanding_balance numeric(38,2),
    phone character varying(255),
    total_loan_amount numeric(38,2),
    total_orders bigint,
    total_purchases numeric(38,2)
);


ALTER TABLE public.customer_debt_report OWNER TO postgres;

--
-- Name: customer_feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_feedbacks (
    feedback_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid,
    order_id uuid,
    rating integer,
    feedback_type character varying(50) DEFAULT 'general'::character varying,
    message text NOT NULL,
    response text,
    status character varying(50) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_feedbacks_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.customer_feedbacks OWNER TO postgres;

--
-- Name: customer_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_payments (
    payment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    customer_id uuid,
    payment_number character varying(100) NOT NULL,
    payment_date date NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_type character varying(50),
    payment_method character varying(100),
    reference_number character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    processed_by uuid,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer_payments OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customer_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    date_of_birth date,
    address text,
    city character varying(100),
    province character varying(100),
    postal_code character varying(20),
    credit_score integer,
    preferred_contact_method character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: dealer_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_contracts (
    contract_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    contract_number character varying(100) NOT NULL,
    contract_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    territory character varying(255),
    commission_rate numeric(5,2),
    minimum_sales_target numeric(15,2),
    contract_status character varying(50) DEFAULT 'active'::character varying,
    signed_date date,
    contract_file_url character varying(500),
    contract_file_path character varying(500),
    terms_and_conditions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dealer_contracts OWNER TO postgres;

--
-- Name: dealer_discount_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_discount_policies (
    policy_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    discount_amount numeric(12,2),
    discount_percent numeric(5,2),
    end_date date NOT NULL,
    policy_name character varying(255) NOT NULL,
    start_date date NOT NULL,
    status character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    variant_id integer NOT NULL
);


ALTER TABLE public.dealer_discount_policies OWNER TO postgres;

--
-- Name: dealer_discount_policies_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_discount_policies_backup (
    policy_id uuid,
    variant_id integer,
    policy_name character varying(255),
    description text,
    discount_percent numeric(5,2),
    discount_amount numeric(12,2),
    start_date date,
    end_date date,
    status character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.dealer_discount_policies_backup OWNER TO postgres;

--
-- Name: dealer_installment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_installment_plans (
    plan_id uuid NOT NULL,
    contract_number character varying(100),
    created_at timestamp(6) without time zone NOT NULL,
    down_payment_amount numeric(15,2) NOT NULL,
    finance_company character varying(255),
    first_payment_date date,
    interest_rate numeric(5,2) NOT NULL,
    last_payment_date date,
    loan_amount numeric(15,2) NOT NULL,
    loan_term_months integer NOT NULL,
    monthly_payment_amount numeric(12,2) NOT NULL,
    plan_status character varying(50) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    invoice_id uuid
);


ALTER TABLE public.dealer_installment_plans OWNER TO postgres;

--
-- Name: dealer_installment_plans_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_installment_plans_backup (
    plan_id uuid,
    invoice_id uuid,
    total_amount numeric(15,2),
    down_payment_amount numeric(15,2),
    loan_amount numeric(15,2),
    interest_rate numeric(5,2),
    loan_term_months integer,
    monthly_payment_amount numeric(12,2),
    first_payment_date date,
    last_payment_date date,
    plan_status character varying(50),
    finance_company character varying(255),
    contract_number character varying(100),
    created_at timestamp without time zone
);


ALTER TABLE public.dealer_installment_plans_backup OWNER TO postgres;

--
-- Name: dealer_installment_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_installment_schedules (
    schedule_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    due_date date NOT NULL,
    installment_number integer NOT NULL,
    interest_amount numeric(12,2),
    late_fee numeric(12,2),
    notes text,
    paid_amount numeric(12,2),
    paid_date date,
    principal_amount numeric(12,2),
    status character varying(50) NOT NULL,
    plan_id uuid NOT NULL
);


ALTER TABLE public.dealer_installment_schedules OWNER TO postgres;

--
-- Name: dealer_installment_schedules_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_installment_schedules_backup (
    schedule_id uuid,
    plan_id uuid,
    installment_number integer,
    due_date date,
    amount numeric(12,2),
    principal_amount numeric(12,2),
    interest_amount numeric(12,2),
    status character varying(50),
    paid_date date,
    paid_amount numeric(12,2),
    late_fee numeric(12,2),
    notes text,
    created_at timestamp without time zone
);


ALTER TABLE public.dealer_installment_schedules_backup OWNER TO postgres;

--
-- Name: dealer_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_invoices (
    invoice_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_number character varying(100) NOT NULL,
    dealer_order_id uuid,
    evm_staff_id uuid,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(15,2) NOT NULL,
    status character varying(50) DEFAULT 'issued'::character varying,
    payment_terms_days integer DEFAULT 30,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dealer_invoices OWNER TO postgres;

--
-- Name: dealer_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_order_items (
    item_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    discount_amount numeric(12,2),
    discount_percentage numeric(5,2),
    final_price numeric(15,2) NOT NULL,
    notes text,
    quantity integer NOT NULL,
    status character varying(50) NOT NULL,
    total_price numeric(15,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    color_id integer NOT NULL,
    dealer_order_id uuid NOT NULL,
    variant_id integer NOT NULL
);


ALTER TABLE public.dealer_order_items OWNER TO postgres;

--
-- Name: dealer_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_orders (
    dealer_order_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    dealer_order_number character varying(100) NOT NULL,
    evm_staff_id uuid,
    order_date date NOT NULL,
    expected_delivery_date date,
    total_quantity integer NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp(6) without time zone,
    approved_by uuid,
    rejection_reason text,
    dealer_id uuid,
    order_type character varying(50) DEFAULT 'PURCHASE'::character varying,
    approval_status character varying(50) DEFAULT 'PENDING'::character varying,
    CONSTRAINT dealer_orders_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT dealer_orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'RESERVE'::character varying, 'SAMPLE'::character varying])::text[])))
);


ALTER TABLE public.dealer_orders OWNER TO postgres;

--
-- Name: dealers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealers (
    dealer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    dealer_code character varying(50) NOT NULL,
    dealer_name character varying(255) NOT NULL,
    contact_person character varying(255),
    email character varying(255),
    phone character varying(20),
    address text,
    city character varying(100),
    province character varying(100),
    postal_code character varying(20),
    dealer_type character varying(50) DEFAULT 'authorized'::character varying,
    license_number character varying(100),
    tax_code character varying(50),
    bank_account character varying(50),
    bank_name character varying(255),
    commission_rate numeric(5,2),
    status character varying(50) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dealers OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    address text,
    date_of_birth date,
    profile_image_url character varying(500),
    profile_image_path character varying(500),
    role_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dealer_id uuid,
    role character varying(50) DEFAULT 'DEALER_STAFF'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: dealer_orders_with_items; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.dealer_orders_with_items AS
 SELECT dor.dealer_order_id,
    dor.dealer_order_number,
    dor.dealer_id,
    d.dealer_name,
    d.dealer_code,
    dor.evm_staff_id,
    concat(u.first_name, ' ', u.last_name) AS evm_staff_name,
    dor.order_date,
    dor.expected_delivery_date,
    dor.total_quantity,
    dor.total_amount,
    dor.status,
    dor.priority,
    dor.order_type,
    dor.approval_status,
    dor.rejection_reason,
    dor.approved_by,
    dor.approved_at,
    dor.notes,
    dor.created_at,
    dor.updated_at,
    count(doi.item_id) AS item_count,
    sum(doi.quantity) AS total_items_quantity,
    sum(doi.final_price) AS calculated_total_amount
   FROM (((public.dealer_orders dor
     LEFT JOIN public.dealers d ON ((dor.dealer_id = d.dealer_id)))
     LEFT JOIN public.users u ON ((dor.evm_staff_id = u.user_id)))
     LEFT JOIN public.dealer_order_items doi ON ((dor.dealer_order_id = doi.dealer_order_id)))
  GROUP BY dor.dealer_order_id, dor.dealer_order_number, dor.dealer_id, d.dealer_name, d.dealer_code, dor.evm_staff_id, u.first_name, u.last_name, dor.order_date, dor.expected_delivery_date, dor.total_quantity, dor.total_amount, dor.status, dor.priority, dor.order_type, dor.approval_status, dor.rejection_reason, dor.approved_by, dor.approved_at, dor.notes, dor.created_at, dor.updated_at;


ALTER VIEW public.dealer_orders_with_items OWNER TO postgres;

--
-- Name: dealer_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_payments (
    payment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    payment_number character varying(100) NOT NULL,
    payment_date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_type character varying(50),
    reference_number character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dealer_payments OWNER TO postgres;

--
-- Name: dealer_performance_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_performance_report (
    target_id uuid NOT NULL,
    achieved_amount numeric(38,2),
    achieved_quantity integer,
    achievement_rate numeric(38,2),
    notes character varying(255),
    performance_level character varying(255),
    target_amount numeric(38,2),
    target_month integer,
    target_quantity integer,
    target_status character varying(255),
    target_type character varying(255),
    target_year integer
);


ALTER TABLE public.dealer_performance_report OWNER TO postgres;

--
-- Name: dealer_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_targets (
    target_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    target_year integer NOT NULL,
    target_month integer,
    target_type character varying(50) NOT NULL,
    target_amount numeric(15,2) NOT NULL,
    target_quantity integer,
    achieved_amount numeric(15,2) DEFAULT 0,
    achieved_quantity integer DEFAULT 0,
    achievement_rate numeric(5,2) GENERATED ALWAYS AS (
CASE
    WHEN (target_amount > (0)::numeric) THEN ((achieved_amount / target_amount) * (100)::numeric)
    ELSE (0)::numeric
END) STORED,
    target_status character varying(50) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dealer_id uuid,
    target_scope character varying(50) DEFAULT 'dealer'::character varying
);


ALTER TABLE public.dealer_targets OWNER TO postgres;

--
-- Name: delivery_tracking_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_tracking_report (
    delivery_id uuid NOT NULL,
    color_name character varying(255),
    customer_name character varying(255),
    customer_phone character varying(255),
    delivered_by character varying(255),
    delivery_address character varying(255),
    delivery_confirmation_date timestamp(6) without time zone,
    delivery_contact_name character varying(255),
    delivery_contact_phone character varying(255),
    delivery_date date,
    delivery_status character varying(255),
    delivery_time time(6) without time zone,
    order_number character varying(255),
    vehicle_info character varying(255),
    vin character varying(255)
);


ALTER TABLE public.delivery_tracking_report OWNER TO postgres;

--
-- Name: installment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installment_plans (
    plan_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    customer_id uuid,
    total_amount numeric(12,2) NOT NULL,
    down_payment_amount numeric(12,2) NOT NULL,
    loan_amount numeric(12,2) NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    loan_term_months integer NOT NULL,
    monthly_payment_amount numeric(10,2) NOT NULL,
    first_payment_date date,
    last_payment_date date,
    plan_status character varying(50) DEFAULT 'active'::character varying,
    finance_company character varying(255),
    contract_number character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    invoice_id uuid,
    dealer_id uuid,
    plan_type character varying(50) DEFAULT 'customer'::character varying
);


ALTER TABLE public.installment_plans OWNER TO postgres;

--
-- Name: installment_plans_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installment_plans_backup (
    plan_id uuid,
    order_id uuid,
    customer_id uuid,
    total_amount numeric(12,2),
    down_payment_amount numeric(12,2),
    loan_amount numeric(12,2),
    interest_rate numeric(5,2),
    loan_term_months integer,
    monthly_payment_amount numeric(10,2),
    first_payment_date date,
    last_payment_date date,
    plan_status character varying(50),
    finance_company character varying(255),
    contract_number character varying(100),
    created_at timestamp without time zone
);


ALTER TABLE public.installment_plans_backup OWNER TO postgres;

--
-- Name: installment_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installment_schedules (
    schedule_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plan_id uuid,
    installment_number integer NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    principal_amount numeric(10,2),
    interest_amount numeric(10,2),
    status character varying(50) DEFAULT 'pending'::character varying,
    paid_date date,
    paid_amount numeric(10,2),
    late_fee numeric(10,2) DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.installment_schedules OWNER TO postgres;

--
-- Name: installment_schedules_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installment_schedules_backup (
    schedule_id uuid,
    plan_id uuid,
    installment_number integer,
    due_date date,
    amount numeric(10,2),
    principal_amount numeric(10,2),
    interest_amount numeric(10,2),
    status character varying(50),
    paid_date date,
    paid_amount numeric(10,2),
    late_fee numeric(10,2),
    notes text,
    created_at timestamp without time zone
);


ALTER TABLE public.installment_schedules_backup OWNER TO postgres;

--
-- Name: inventory_turnover_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_turnover_report (
    brand_name character varying(255) NOT NULL,
    available_count bigint,
    avg_cost_price numeric(38,2),
    avg_profit_margin numeric(38,2),
    avg_selling_price numeric(38,2),
    color_name character varying(255),
    first_arrival date,
    last_arrival date,
    model_name character varying(255),
    reserved_count bigint,
    sold_count bigint,
    total_inventory bigint,
    variant_name character varying(255)
);


ALTER TABLE public.inventory_turnover_report OWNER TO postgres;

--
-- Name: monthly_sales_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_sales_summary (
    sales_year numeric(38,2) NOT NULL,
    avg_order_value numeric(38,2),
    cash_orders bigint,
    installment_orders bigint,
    sales_month numeric(38,2),
    total_balance numeric(38,2),
    total_deposits numeric(38,2),
    total_orders bigint,
    total_revenue numeric(38,2)
);


ALTER TABLE public.monthly_sales_summary OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(100) NOT NULL,
    quotation_id uuid,
    customer_id uuid,
    user_id uuid,
    inventory_id uuid,
    order_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    total_amount numeric(12,2),
    deposit_amount numeric(12,2),
    balance_amount numeric(12,2),
    payment_method character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivery_date date,
    special_requests text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: pending_dealer_orders_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.pending_dealer_orders_summary AS
 SELECT dor.dealer_order_id,
    dor.dealer_order_number,
    d.dealer_name,
    dor.order_date,
    dor.total_quantity,
    dor.total_amount,
    dor.priority,
    dor.order_type,
    count(doi.item_id) AS item_count
   FROM ((public.dealer_orders dor
     JOIN public.dealers d ON ((dor.dealer_id = d.dealer_id)))
     LEFT JOIN public.dealer_order_items doi ON ((dor.dealer_order_id = doi.dealer_order_id)))
  WHERE ((dor.approval_status)::text = 'PENDING'::text)
  GROUP BY dor.dealer_order_id, dor.dealer_order_number, d.dealer_name, dor.order_date, dor.total_quantity, dor.total_amount, dor.priority, dor.order_type;


ALTER VIEW public.pending_dealer_orders_summary OWNER TO postgres;

--
-- Name: pricing_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_policies (
    policy_id uuid DEFAULT gen_random_uuid() NOT NULL,
    policy_name character varying(255) NOT NULL,
    description text,
    policy_type character varying(50) DEFAULT 'standard'::character varying,
    base_price numeric(12,2),
    discount_percent numeric(5,2),
    discount_amount numeric(12,2),
    markup_percent numeric(5,2),
    markup_amount numeric(12,2),
    effective_date date NOT NULL,
    expiry_date date,
    min_quantity integer,
    max_quantity integer,
    customer_type character varying(50),
    region character varying(100),
    status character varying(50) DEFAULT 'active'::character varying,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    variant_id integer,
    dealer_id uuid,
    scope character varying(50) DEFAULT 'global'::character varying
);


ALTER TABLE public.pricing_policies OWNER TO postgres;

--
-- Name: pricing_policies_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_policies_backup (
    policy_id uuid,
    policy_name character varying(255),
    description text,
    policy_type character varying(50),
    base_price numeric(12,2),
    discount_percent numeric(5,2),
    discount_amount numeric(12,2),
    markup_percent numeric(5,2),
    markup_amount numeric(12,2),
    effective_date date,
    expiry_date date,
    min_quantity integer,
    max_quantity integer,
    customer_type character varying(50),
    region character varying(100),
    status character varying(50),
    priority integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    variant_id integer
);


ALTER TABLE public.pricing_policies_backup OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    promotion_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    variant_id integer,
    title character varying(255) NOT NULL,
    description text,
    discount_percent numeric(5,2),
    discount_amount numeric(12,2),
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    quotation_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_number character varying(100) NOT NULL,
    customer_id uuid,
    user_id uuid,
    variant_id integer,
    color_id integer,
    quotation_date date DEFAULT CURRENT_DATE NOT NULL,
    total_price numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0,
    final_price numeric(12,2) NOT NULL,
    validity_days integer DEFAULT 7,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: sales_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_contracts (
    contract_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    contract_number character varying(100) NOT NULL,
    order_id uuid,
    customer_id uuid,
    user_id uuid,
    contract_date date NOT NULL,
    delivery_date date,
    contract_value numeric(15,2) NOT NULL,
    payment_terms text,
    warranty_period_months integer DEFAULT 24,
    contract_status character varying(50) DEFAULT 'draft'::character varying,
    signed_date date,
    contract_file_url character varying(500),
    contract_file_path character varying(500),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales_contracts OWNER TO postgres;

--
-- Name: sales_report_by_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_report_by_staff (
    user_id uuid NOT NULL,
    avg_order_value numeric(38,2),
    completed_orders bigint,
    completed_sales numeric(38,2),
    role_id integer,
    role_name character varying(255),
    staff_name character varying(255),
    total_orders bigint,
    total_sales numeric(38,2)
);


ALTER TABLE public.sales_report_by_staff OWNER TO postgres;

--
-- Name: test_drive_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_drive_schedules (
    schedule_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    notes text,
    preferred_date date NOT NULL,
    preferred_time time(6) without time zone NOT NULL,
    status character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    customer_id uuid,
    variant_id integer
);


ALTER TABLE public.test_drive_schedules OWNER TO postgres;

--
-- Name: test_drive_schedules_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_drive_schedules_backup (
    schedule_id uuid,
    customer_id uuid,
    variant_id integer,
    preferred_date date,
    preferred_time time without time zone,
    status character varying(50),
    notes text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.test_drive_schedules_backup OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    permissions character varying(4000) DEFAULT '{}'::character varying NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_role_id_seq OWNER TO postgres;

--
-- Name: user_roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_role_id_seq OWNED BY public.user_roles.role_id;


--
-- Name: vehicle_brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_brands (
    brand_id integer NOT NULL,
    brand_name character varying(100) NOT NULL,
    country character varying(100),
    founded_year integer,
    brand_logo_url character varying(500),
    brand_logo_path character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicle_brands OWNER TO postgres;

--
-- Name: vehicle_brands_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_brands_brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_brands_brand_id_seq OWNER TO postgres;

--
-- Name: vehicle_brands_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_brands_brand_id_seq OWNED BY public.vehicle_brands.brand_id;


--
-- Name: vehicle_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_colors (
    color_id integer NOT NULL,
    color_name character varying(100) NOT NULL,
    color_code character varying(20),
    color_swatch_url character varying(500),
    color_swatch_path character varying(500),
    is_active boolean DEFAULT true
);


ALTER TABLE public.vehicle_colors OWNER TO postgres;

--
-- Name: vehicle_colors_color_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_colors_color_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_colors_color_id_seq OWNER TO postgres;

--
-- Name: vehicle_colors_color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_colors_color_id_seq OWNED BY public.vehicle_colors.color_id;


--
-- Name: vehicle_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_deliveries (
    delivery_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    inventory_id uuid,
    customer_id uuid,
    delivery_date date NOT NULL,
    delivery_time time without time zone,
    delivery_address text NOT NULL,
    delivery_contact_name character varying(100),
    delivery_contact_phone character varying(20),
    delivery_status character varying(50) DEFAULT 'scheduled'::character varying,
    delivery_notes text,
    delivered_by uuid,
    delivery_confirmation_date timestamp without time zone,
    customer_signature_url character varying(500),
    customer_signature_path character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actual_delivery_date date,
    condition character varying(100),
    notes text,
    scheduled_delivery_date date,
    dealer_order_id uuid,
    dealer_order_item_id uuid
);


ALTER TABLE public.vehicle_deliveries OWNER TO postgres;

--
-- Name: vehicle_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_inventory (
    inventory_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    variant_id integer,
    color_id integer,
    warehouse_id uuid,
    warehouse_location character varying(100),
    vin character varying(17),
    chassis_number character varying(50),
    manufacturing_date date,
    arrival_date date,
    status character varying(50) DEFAULT 'available'::character varying,
    cost_price numeric(12,2),
    selling_price numeric(12,2),
    vehicle_images jsonb,
    interior_images jsonb,
    exterior_images jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vehicle_inventory_exterior_images_valid_json CHECK (((exterior_images IS NULL) OR (jsonb_typeof(exterior_images) = 'object'::text))),
    CONSTRAINT chk_vehicle_inventory_interior_images_valid_json CHECK (((interior_images IS NULL) OR (jsonb_typeof(interior_images) = 'object'::text))),
    CONSTRAINT chk_vehicle_inventory_vehicle_images_valid_json CHECK (((vehicle_images IS NULL) OR (jsonb_typeof(vehicle_images) = 'object'::text)))
);


ALTER TABLE public.vehicle_inventory OWNER TO postgres;

--
-- Name: vehicle_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_models (
    model_id integer NOT NULL,
    brand_id integer,
    model_name character varying(100) NOT NULL,
    model_year integer NOT NULL,
    vehicle_type character varying(50),
    description text,
    specifications jsonb,
    model_image_url character varying(500),
    model_image_path character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vehicle_models_specifications_valid_json CHECK (((specifications IS NULL) OR (jsonb_typeof(specifications) = 'object'::text)))
);


ALTER TABLE public.vehicle_models OWNER TO postgres;

--
-- Name: vehicle_models_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_models_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_models_model_id_seq OWNER TO postgres;

--
-- Name: vehicle_models_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_models_model_id_seq OWNED BY public.vehicle_models.model_id;


--
-- Name: vehicle_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_variants (
    variant_id integer NOT NULL,
    model_id integer,
    variant_name character varying(100) NOT NULL,
    battery_capacity numeric(8,2),
    range_km integer,
    power_kw numeric(8,2),
    acceleration_0_100 numeric(4,2),
    top_speed integer,
    charging_time_fast integer,
    charging_time_slow integer,
    price_base numeric(12,2),
    variant_image_url character varying(500),
    variant_image_path character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicle_variants OWNER TO postgres;

--
-- Name: vehicle_variants_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_variants_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_variants_variant_id_seq OWNER TO postgres;

--
-- Name: vehicle_variants_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_variants_variant_id_seq OWNED BY public.vehicle_variants.variant_id;


--
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    warehouse_name character varying(255) DEFAULT 'Main EV Warehouse'::character varying NOT NULL,
    warehouse_code character varying(50) DEFAULT 'MAIN_WAREHOUSE'::character varying NOT NULL,
    address text NOT NULL,
    city character varying(100),
    province character varying(100),
    postal_code character varying(20),
    phone character varying(20),
    email character varying(255),
    capacity integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- Name: user_roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN role_id SET DEFAULT nextval('public.user_roles_role_id_seq'::regclass);


--
-- Name: vehicle_brands brand_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands ALTER COLUMN brand_id SET DEFAULT nextval('public.vehicle_brands_brand_id_seq'::regclass);


--
-- Name: vehicle_colors color_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_colors ALTER COLUMN color_id SET DEFAULT nextval('public.vehicle_colors_color_id_seq'::regclass);


--
-- Name: vehicle_models model_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_models ALTER COLUMN model_id SET DEFAULT nextval('public.vehicle_models_model_id_seq'::regclass);


--
-- Name: vehicle_variants variant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_variants ALTER COLUMN variant_id SET DEFAULT nextval('public.vehicle_variants_variant_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, customer_id, staff_id, appointment_type, title, description, appointment_date, duration_minutes, location, status, notes, created_at, updated_at, variant_id) FROM stdin;
a0bb45f0-e026-4548-ac0e-7e531a611525	23c800a2-5903-4b5e-bb41-c86e0e4a5107	\N	test_drive	Test Drive - Standard Range	\N	2024-03-20 10:00:00	60	\N	pending	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	1
ab2e7251-dcab-46e1-be82-bf42178dc8af	bc295b71-4784-42bb-8711-573b48d28101	\N	test_drive	Test Drive - VF 5 Standard	\N	2024-03-20 10:00:00	60	\N	pending	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996	8
0bbd5116-4504-4304-8a7d-fec50a78b666	0766234c-d354-476c-a8f9-200cd74f2d9e	\N	test_drive	Test Drive - Model 3 Standard Range	\N	2024-03-25 14:00:00	60	\N	pending	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996	3
1d956e90-14db-4927-a883-8a8bd53994c8	\N	\N	test_drive	Lái thử xe - Test Customer	\N	2024-12-20 03:00:00	60	\N	scheduled	Test appointment\nCustomer: Test Customer (test@example.com, 0123456789), Variant ID: 1	2025-10-26 15:24:30.955333	2025-10-26 15:24:30.955333	\N
af293c23-38d8-4106-b37b-f7195dcde0ed	\N	\N	delivery	Nhận xe - Test Customer	\N	2024-12-25 07:00:00	60	\N	scheduled	Test delivery appointment\nCustomer: Test Customer (test@example.com, 0123456789), Order ID: 48bbd74e-ce34-4f48-9b26-eb9e0c9de16a, Address: 123 Test Street, Ho Chi Minh City	2025-10-26 15:29:47.056141	2025-10-26 15:29:47.056141	\N
\.


--
-- Data for Name: appointments_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments_backup (appointment_id, customer_id, staff_id, appointment_type, title, description, appointment_date, duration_minutes, location, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_debt_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_debt_report (customer_id, active_installments, customer_name, email, last_order_date, outstanding_balance, phone, total_loan_amount, total_orders, total_purchases) FROM stdin;
\.


--
-- Data for Name: customer_feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_feedbacks (feedback_id, customer_id, order_id, rating, feedback_type, message, response, status, created_at, updated_at) FROM stdin;
3512230a-8c44-46d8-b4c1-c10e2199936a	e9c41a60-f600-4188-80fb-55fbc60ae128	1a242971-a5d8-41ae-9681-0b4081c6a5da	5	general	Dịch vụ tốt, giao xe đúng hẹn	\N	resolved	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
ecba9a9d-180c-41b8-9ca5-d08d413c2c70	23c800a2-5903-4b5e-bb41-c86e0e4a5107	f574227f-d7c9-4145-91bd-a3b2bf409b6a	4	service	Nhân viên tư vấn nhiệt tình	\N	resolved	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
7ee1382a-090d-4aec-81a1-d2034e4c38e6	\N	\N	5	compliment	I love this car!\n\nCustomer Info: Test Customer (test@example.com, 0123456789), Subject: Great service	\N	pending	2025-10-26 15:24:24.914978	2025-10-26 15:24:24.914978
68ff9047-6820-4e42-bde1-9371d821d90d	\N	\N	5	compliment	I love this car!\n\nCustomer Info: Test Customer (test@example.com, 0123456789), Variant ID: 1, Subject: Great service	\N	pending	2025-10-26 15:25:21.827458	2025-10-26 15:25:21.827458
\.


--
-- Data for Name: customer_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_payments (payment_id, order_id, customer_id, payment_number, payment_date, amount, payment_type, payment_method, reference_number, status, processed_by, notes, created_at) FROM stdin;
7f52485c-db0b-4fbf-970d-10cadeeb4472	1a242971-a5d8-41ae-9681-0b4081c6a5da	e9c41a60-f600-4188-80fb-55fbc60ae128	CUST-PAY-2024-001	2024-02-15	236000000.00	down_payment	bank_transfer	\N	completed	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	2025-10-14 23:14:45.443104
5427f291-b31a-48dc-855a-79f269cb4ab7	f574227f-d7c9-4145-91bd-a3b2bf409b6a	23c800a2-5903-4b5e-bb41-c86e0e4a5107	CUST-PAY-2024-002	2024-02-16	800000000.00	full_payment	bank_transfer	\N	completed	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	2025-10-14 23:15:14.855996
32c9ee85-fd3a-4b07-a9e9-f8145ec12cc9	48bbd74e-ce34-4f48-9b26-eb9e0c9de16a	\N	PAY-1761492535661	2025-10-26	100000000.00	deposit	bank_transfer	\N	pending	\N	Test deposit payment	2025-10-26 15:28:55.667017
941f3463-4521-4c0f-bca0-552cd2e875ca	48bbd74e-ce34-4f48-9b26-eb9e0c9de16a	\N	PAY-1761492593226	2025-10-26	1000000000.00	full	credit_card	\N	pending	\N	Test full payment	2025-10-26 15:29:53.227518
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (customer_id, first_name, last_name, email, phone, date_of_birth, address, city, province, postal_code, credit_score, preferred_contact_method, notes, created_at, updated_at) FROM stdin;
e9c41a60-f600-4188-80fb-55fbc60ae128	Nguyen	Van Minh	minh.nguyen@email.com	+84-901-234-567	\N	123 Le Loi Street, District 1	Ho Chi Minh City	Ho Chi Minh	\N	750	\N	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
23c800a2-5903-4b5e-bb41-c86e0e4a5107	Tran	Thi Lan	lan.tran@email.com	+84-902-345-678	\N	456 Nguyen Trai Street, Thanh Xuan District	Hanoi	Hanoi	\N	720	\N	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
bc295b71-4784-42bb-8711-573b48d28101	Le	Van Nam	nam.le@email.com	+84-903-456-789	\N	789 Dong Khoi Street, District 1	Ho Chi Minh City	Ho Chi Minh	\N	680	\N	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
0766234c-d354-476c-a8f9-200cd74f2d9e	Pham	Thi Hoa	hoa.pham@email.com	+84-904-567-890	\N	321 Hai Ba Trung Street, District 3	Ho Chi Minh City	Ho Chi Minh	\N	800	\N	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
63ca8da6-7a26-4c64-b022-af66f4b27817	Vo	Van Duc	duc.vo@email.com	+84-905-678-901	\N	654 Pasteur Street, District 3	Ho Chi Minh City	Ho Chi Minh	\N	650	\N	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
80ff5c2e-f596-4638-9f14-733ae515bbeb	Van Hoang	Le	hoang.le@email.com	+84-903-456-789	1988-07-20	789 Tran Hung Dao Street, District 5	Ho Chi Minh City	Ho Chi Minh	\N	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
2d374584-fb65-472d-83a5-c1136f26bc38	Thi Thu	Nguyen	thu.nguyen@email.com	+84-904-567-890	1990-11-15	321 Le Van Viet Street, Thu Duc City	Ho Chi Minh City	Ho Chi Minh	\N	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
1dccdf2f-42f0-4cb4-b95e-ecf9555f1ed3	Van Duc	Pham	duc.pham@email.com	+84-905-678-901	1987-04-10	654 Nguyen Thi Minh Khai Street, District 3	Ho Chi Minh City	Ho Chi Minh	\N	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
c9d8700b-8fe3-45e7-8eeb-c9ab1c3e44e4	Thi Mai	Tran	mai.tran@email.com	+84-906-789-012	1992-09-25	987 Vo Van Tan Street, District 3	Ho Chi Minh City	Ho Chi Minh	\N	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
acba6a37-29d9-46f6-8c94-9dfa730d0d89	John	Doe	john.doe@email.com	+84-901-234-567	\N	123 Le Loi Street, District 1	Ho Chi Minh City	Ho Chi Minh	\N	\N	\N	\N	2025-10-15 00:38:33.959218	2025-10-15 00:38:33.959218
78fe7eb0-ceb8-4793-a8af-187a3fe26f67	Jane	Smith	jane.smith@email.com	+84-902-345-678	\N	456 Nguyen Trai Street, Thanh Xuan District	Hanoi	Hanoi	\N	\N	\N	\N	2025-10-15 00:38:33.959218	2025-10-15 00:38:33.959218
d048de9b-2536-4c63-96cd-19633fc37bd5	tes	test	test@gmail.ocm	0123456789	\N					\N	\N	Quan tâm đến xe: BYD Atto 3 Extended Atto 3 Extended Range\n\nTin nhắn: ok	2025-10-23 11:09:34.226912	2025-10-23 11:09:34.226912
857e6f28-99d8-455d-8d19-484d3f8bbc71	test	test	test@gmail.com	0147852369	\N					\N	\N	Quan tâm đến xe: BYD Atto 3 Atto 3 Standard\n\nTin nhắn: 	2025-10-23 11:19:29.851027	2025-10-23 11:19:29.851027
\.


--
-- Data for Name: dealer_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_contracts (contract_id, contract_number, contract_type, start_date, end_date, territory, commission_rate, minimum_sales_target, contract_status, signed_date, contract_file_url, contract_file_path, terms_and_conditions, created_at, updated_at) FROM stdin;
f1abe2b8-c6b0-4e1e-b54e-d2f27a349f5d	DC-2024-001	exclusive	2024-01-01	2024-12-31	Ho Chi Minh City	3.50	50000000000.00	active	2023-12-15	https://example.com/contracts/DC-2024-001.pdf	\N	Hợp đồng đại lý độc quyền tại TP.HCM	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
\.


--
-- Data for Name: dealer_discount_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_discount_policies (policy_id, created_at, description, discount_amount, discount_percent, end_date, policy_name, start_date, status, updated_at, variant_id) FROM stdin;
\.


--
-- Data for Name: dealer_discount_policies_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_discount_policies_backup (policy_id, variant_id, policy_name, description, discount_percent, discount_amount, start_date, end_date, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dealer_installment_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_installment_plans (plan_id, contract_number, created_at, down_payment_amount, finance_company, first_payment_date, interest_rate, last_payment_date, loan_amount, loan_term_months, monthly_payment_amount, plan_status, total_amount, invoice_id) FROM stdin;
\.


--
-- Data for Name: dealer_installment_plans_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_installment_plans_backup (plan_id, invoice_id, total_amount, down_payment_amount, loan_amount, interest_rate, loan_term_months, monthly_payment_amount, first_payment_date, last_payment_date, plan_status, finance_company, contract_number, created_at) FROM stdin;
37516889-d4c8-4118-a715-321e3b53016f	7578326c-b3cb-4c79-99fb-61118f0494e0	2000000000.00	400000000.00	1600000000.00	7.50	24	75000000.00	2024-03-01	2026-02-01	active	EV Finance	EVF-DEALER-2024-001	2025-10-14 23:14:45.443104
\.


--
-- Data for Name: dealer_installment_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_installment_schedules (schedule_id, amount, created_at, due_date, installment_number, interest_amount, late_fee, notes, paid_amount, paid_date, principal_amount, status, plan_id) FROM stdin;
\.


--
-- Data for Name: dealer_installment_schedules_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_installment_schedules_backup (schedule_id, plan_id, installment_number, due_date, amount, principal_amount, interest_amount, status, paid_date, paid_amount, late_fee, notes, created_at) FROM stdin;
\.


--
-- Data for Name: dealer_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_invoices (invoice_id, invoice_number, dealer_order_id, evm_staff_id, invoice_date, due_date, subtotal, tax_amount, discount_amount, total_amount, status, payment_terms_days, notes, created_at, updated_at) FROM stdin;
7578326c-b3cb-4c79-99fb-61118f0494e0	INV-2024-001	58798e68-c111-4214-98e4-2ac38bf7e070	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-02-02	2024-03-03	2000000000.00	0.00	0.00	2000000000.00	issued	30	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
db0b4cf2-bed0-4eef-a205-484c91c893e1	INV-2024-002	1322d6b5-89c9-43fd-8006-aea1b2de29c5	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-02-15	2024-03-15	1500000000.00	150000000.00	0.00	1650000000.00	issued	30	Hóa đơn cho đơn hàng DO-2024-002	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
00d9bac4-de71-493f-8663-5652597f9658	INV-2024-003	58798e68-c111-4214-98e4-2ac38bf7e070	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-02-20	2024-03-20	2500000000.00	250000000.00	100000000.00	2650000000.00	issued	30	Hóa đơn cho đơn hàng DO-2024-003 với chiết khấu	2025-10-14 23:18:22.035186	2025-10-14 23:26:46.854412
a881beab-d069-4816-8b62-aa9971c146ba	INV-2024-004	adce34fb-a0c7-4207-805b-648184bfdd88	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-03-01	2024-04-01	4500000000.00	450000000.00	0.00	4950000000.00	issued	30	Hóa đơn cho đơn hàng DO-2024-004	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036
5acdfb08-d429-4d7c-b02b-deaf0fec6a9e	INV-2024-005	8b8f66e8-de7d-4e0a-8a3b-3266589b0fbc	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-03-02	2024-04-02	5400000000.00	540000000.00	100000000.00	5840000000.00	issued	30	Hóa đơn cho đơn hàng DO-2024-005	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036
9e213c0e-0603-4554-b3f3-77898789d1f5	INV-1761563442904	\N	\N	2025-10-27	2025-11-26	0.00	0.00	0.00	0.00	PENDING	30	Generated from dealer order: f0c36e1b-5339-4046-b83c-71a9c39c9a31	2025-10-27 11:10:42.905377	2025-10-27 11:10:42.905377
\.


--
-- Data for Name: dealer_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_order_items (item_id, created_at, discount_amount, discount_percentage, final_price, notes, quantity, status, total_price, unit_price, updated_at, color_id, dealer_order_id, variant_id) FROM stdin;
1ab3ceb2-f2c1-4d30-a21d-309f1d156d18	2025-10-27 11:07:58.864977	150000000.00	5.00	2850000000.00	Test item	2	CONFIRMED	3000000000.00	1500000000.00	2025-10-27 18:08:26.698832	1	f0c36e1b-5339-4046-b83c-71a9c39c9a31	1
\.


--
-- Data for Name: dealer_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_orders (dealer_order_id, dealer_order_number, evm_staff_id, order_date, expected_delivery_date, total_quantity, total_amount, status, priority, notes, created_at, updated_at, approved_at, approved_by, rejection_reason, dealer_id, order_type, approval_status) FROM stdin;
f0c36e1b-5339-4046-b83c-71a9c39c9a31	DO-1761563278852	6f2431b7-10c9-4d61-b612-33e11b923752	2024-01-15	2024-02-15	2	2850000000.00	CONFIRMED	HIGH	Test order	2025-10-27 11:07:58.862947	2025-10-27 18:08:26.698832	2025-10-27 11:08:26.707953	6f2431b7-10c9-4d61-b612-33e11b923752	\N	ddc4d0fe-7bb6-4b33-8e27-e6b61e1f205f	PURCHASE	APPROVED
58798e68-c111-4214-98e4-2ac38bf7e070	DO-2024-001	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-02-01	\N	2	2000000000.00	CONFIRMED	NORMAL	\N	2025-10-14 23:14:45.443104	2025-10-27 18:01:31.941595	\N	\N	\N	\N	PURCHASE	PENDING
1322d6b5-89c9-43fd-8006-aea1b2de29c5	DO-2024-002	2d9d55af-f0db-4210-b6a4-3f7ef4f72682	2024-02-10	\N	3	3000000000.00	PENDING	NORMAL	\N	2025-10-14 23:15:14.855996	2025-10-27 18:01:31.941595	\N	\N	\N	\N	PURCHASE	PENDING
4831a231-6d32-4e3f-a3c2-f8974896c3e1	DO-2024-003	611d8920-389f-44c6-91b4-686c7872b8e3	2024-02-15	\N	2	2500000000.00	CONFIRMED	NORMAL	Đơn hàng thứ 3 của đại lý HCM	2025-10-14 23:18:22.035186	2025-10-27 18:01:31.941595	\N	\N	\N	\N	PURCHASE	PENDING
adce34fb-a0c7-4207-805b-648184bfdd88	DO-2024-004	611d8920-389f-44c6-91b4-686c7872b8e3	2024-03-01	\N	2	5000000000.00	CONFIRMED	NORMAL	Đơn hàng Tesla Model S và Model X	2025-10-14 23:46:18.12036	2025-10-27 18:01:31.941595	\N	\N	\N	\N	PURCHASE	PENDING
8b8f66e8-de7d-4e0a-8a3b-3266589b0fbc	DO-2024-005	611d8920-389f-44c6-91b4-686c7872b8e3	2024-03-02	\N	3	6000000000.00	CONFIRMED	NORMAL	Đơn hàng BMW và Mercedes	2025-10-14 23:46:18.12036	2025-10-27 18:01:31.941595	\N	\N	\N	\N	PURCHASE	PENDING
\.


--
-- Data for Name: dealer_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_payments (payment_id, invoice_id, payment_number, payment_date, amount, payment_type, reference_number, status, notes, created_at) FROM stdin;
bc124263-3e11-44d6-be8c-d0346cb5be53	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-001	2024-02-20	400000000.00	down_payment	\N	completed	\N	2025-10-14 23:14:45.443104
c3d93496-1252-46c2-81b1-85e441bf4b1c	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-004	2024-03-01	75000000.00	installment	\N	completed	\N	2025-10-14 23:18:22.035186
b0af5c48-e271-4aa9-a0a7-9ed31f5937b9	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-002	2024-02-25	500000000.00	down_payment	\N	completed	\N	2025-10-14 23:18:22.035186
930e7489-2498-4bed-b79a-b8844d79d68c	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-003	2024-02-28	800000000.00	down_payment	\N	completed	\N	2025-10-14 23:18:22.035186
f22513af-b09a-40ee-a1c9-8592070ff012	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-005	2024-03-01	85000000.00	installment	\N	completed	\N	2025-10-14 23:18:22.035186
fcd43bec-d23c-4aab-949f-80b9a4649c9d	7578326c-b3cb-4c79-99fb-61118f0494e0	DEALER-PAY-2024-006	2024-03-05	90000000.00	installment	\N	pending	\N	2025-10-14 23:18:22.035186
d2ebb5b3-79d3-487b-94c7-01c50999c963	a881beab-d069-4816-8b62-aa9971c146ba	DEALER-PAY-2024-007	2024-03-01	990000000.00	down_payment	\N	completed	\N	2025-10-14 23:46:18.12036
9750add8-b479-47ba-9a1b-16e987d1ddd0	5acdfb08-d429-4d7c-b02b-deaf0fec6a9e	DEALER-PAY-2024-008	2024-03-02	1168000000.00	down_payment	\N	completed	\N	2025-10-14 23:46:18.12036
\.


--
-- Data for Name: dealer_performance_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_performance_report (target_id, achieved_amount, achieved_quantity, achievement_rate, notes, performance_level, target_amount, target_month, target_quantity, target_status, target_type, target_year) FROM stdin;
\.


--
-- Data for Name: dealer_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_targets (target_id, target_year, target_month, target_type, target_amount, target_quantity, achieved_amount, achieved_quantity, target_status, notes, created_at, updated_at, dealer_id, target_scope) FROM stdin;
36888548-0f6e-4d2e-9dce-b2960a110dbf	2024	1	monthly	5000000000.00	4	1200000000.00	1	active	Chỉ tiêu tháng 1/2024	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	\N	dealer
ca72dcc3-ea16-4c19-91b1-7b98b9a9e836	2024	2	monthly	6000000000.00	5	1180000000.00	1	active	Chỉ tiêu tháng 2/2024	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	\N	dealer
87aa5aed-6157-4f80-9e78-90fddf847c42	2024	\N	yearly	60000000000.00	50	2380000000.00	2	active	Chỉ tiêu cả năm 2024	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	\N	dealer
\.


--
-- Data for Name: dealers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealers (dealer_id, dealer_code, dealer_name, contact_person, email, phone, address, city, province, postal_code, dealer_type, license_number, tax_code, bank_account, bank_name, commission_rate, status, notes, created_at, updated_at) FROM stdin;
ddc4d0fe-7bb6-4b33-8e27-e6b61e1f205f	DLR001	Test Dealer	John Doe	test@dealer.com	0123456789	123 Test Street	Ho Chi Minh	Ho Chi Minh	700000	authorized	LIC001	TAX001	1234567890	Test Bank	5.00	active	Test dealer for API testing	2025-10-27 11:07:04.75123	2025-10-27 11:07:04.75123
\.


--
-- Data for Name: delivery_tracking_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_tracking_report (delivery_id, color_name, customer_name, customer_phone, delivered_by, delivery_address, delivery_confirmation_date, delivery_contact_name, delivery_contact_phone, delivery_date, delivery_status, delivery_time, order_number, vehicle_info, vin) FROM stdin;
\.


--
-- Data for Name: installment_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installment_plans (plan_id, order_id, customer_id, total_amount, down_payment_amount, loan_amount, interest_rate, loan_term_months, monthly_payment_amount, first_payment_date, last_payment_date, plan_status, finance_company, contract_number, created_at, invoice_id, dealer_id, plan_type) FROM stdin;
569515c4-22c0-40f6-be0d-d4191e1045bc	1a242971-a5d8-41ae-9681-0b4081c6a5da	e9c41a60-f600-4188-80fb-55fbc60ae128	1180000000.00	236000000.00	944000000.00	8.50	36	30000000.00	2024-03-15	2027-02-15	active	Vietcombank	VCB-INST-2024-001	2025-10-14 23:14:45.443104	\N	\N	customer
d5696832-b27a-4a2c-9d86-62d25826bdfd	c6544d05-f1e6-4842-a1cc-3a6af4a873e7	bc295b71-4784-42bb-8711-573b48d28101	350000000.00	0.00	350000000.00	9.00	24	16000000.00	2024-03-17	2026-02-17	active	BIDV	BIDV-INST-2024-001	2025-10-14 23:15:14.855996	\N	\N	customer
37516889-d4c8-4118-a715-321e3b53016f	\N	\N	2000000000.00	400000000.00	1600000000.00	7.50	24	75000000.00	2024-03-01	2026-02-01	active	EV Finance	EVF-DEALER-2024-001	2025-10-14 23:14:45.443104	7578326c-b3cb-4c79-99fb-61118f0494e0	\N	dealer
\.


--
-- Data for Name: installment_plans_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installment_plans_backup (plan_id, order_id, customer_id, total_amount, down_payment_amount, loan_amount, interest_rate, loan_term_months, monthly_payment_amount, first_payment_date, last_payment_date, plan_status, finance_company, contract_number, created_at) FROM stdin;
569515c4-22c0-40f6-be0d-d4191e1045bc	1a242971-a5d8-41ae-9681-0b4081c6a5da	e9c41a60-f600-4188-80fb-55fbc60ae128	1180000000.00	236000000.00	944000000.00	8.50	36	30000000.00	2024-03-15	2027-02-15	active	Vietcombank	VCB-INST-2024-001	2025-10-14 23:14:45.443104
d5696832-b27a-4a2c-9d86-62d25826bdfd	c6544d05-f1e6-4842-a1cc-3a6af4a873e7	bc295b71-4784-42bb-8711-573b48d28101	350000000.00	0.00	350000000.00	9.00	24	16000000.00	2024-03-17	2026-02-17	active	BIDV	BIDV-INST-2024-001	2025-10-14 23:15:14.855996
\.


--
-- Data for Name: installment_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installment_schedules (schedule_id, plan_id, installment_number, due_date, amount, principal_amount, interest_amount, status, paid_date, paid_amount, late_fee, notes, created_at) FROM stdin;
\.


--
-- Data for Name: installment_schedules_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installment_schedules_backup (schedule_id, plan_id, installment_number, due_date, amount, principal_amount, interest_amount, status, paid_date, paid_amount, late_fee, notes, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_turnover_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_turnover_report (brand_name, available_count, avg_cost_price, avg_profit_margin, avg_selling_price, color_name, first_arrival, last_arrival, model_name, reserved_count, sold_count, total_inventory, variant_name) FROM stdin;
\.


--
-- Data for Name: monthly_sales_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_sales_summary (sales_year, avg_order_value, cash_orders, installment_orders, sales_month, total_balance, total_deposits, total_orders, total_revenue) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, order_number, quotation_id, customer_id, user_id, inventory_id, order_date, status, total_amount, deposit_amount, balance_amount, payment_method, notes, created_at, updated_at, delivery_date, special_requests) FROM stdin;
1a242971-a5d8-41ae-9681-0b4081c6a5da	ORD-2024-001	e13dea70-2661-4527-ab52-13284fa3eff9	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	863a8f02-b9ba-4f21-bbf9-5dd09b481532	2024-02-15	confirmed	1180000000.00	236000000.00	944000000.00	installment	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	\N	\N
f574227f-d7c9-4145-91bd-a3b2bf409b6a	ORD-2024-002	869777a2-80ac-4996-a9cb-d7707d4d678b	23c800a2-5903-4b5e-bb41-c86e0e4a5107	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	0b519b1c-e178-4ede-8a42-688362cb3198	2024-02-16	completed	800000000.00	800000000.00	0.00	cash	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996	\N	\N
c6544d05-f1e6-4842-a1cc-3a6af4a873e7	ORD-2024-003	2cf9b2c9-db82-40fc-9629-fcee4ddf0c8d	bc295b71-4784-42bb-8711-573b48d28101	52b27bc0-f457-4f96-bcaf-d20daadf9f56	6d43eb8d-6a31-404e-abdb-9389b86e7c17	2024-02-17	pending	350000000.00	0.00	350000000.00	installment	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996	\N	\N
9d1df0e1-37e3-4e10-8f7d-a372407c96a3	ORD-2024-004	e13dea70-2661-4527-ab52-13284fa3eff9	\N	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	782dad0d-39d8-42c5-b7b7-961f4ad47372	2024-02-20	confirmed	1800000000.00	360000000.00	1440000000.00	installment	Đơn hàng BMW iX xDrive50 cho Nguyễn Thị Thu	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405	\N	\N
3ce3238d-ad13-45b5-aebc-c85522e8588b	ORD-2024-005	e13dea70-2661-4527-ab52-13284fa3eff9	\N	52b27bc0-f457-4f96-bcaf-d20daadf9f56	863a8f02-b9ba-4f21-bbf9-5dd09b481532	2024-02-22	confirmed	2200000000.00	440000000.00	1760000000.00	installment	Đơn hàng Mercedes EQS 450+ cho Phạm Văn Đức	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405	\N	\N
d9af974c-0dea-434d-8463-4333596eac52	ORD-2024-006	e13dea70-2661-4527-ab52-13284fa3eff9	\N	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	863a8f02-b9ba-4f21-bbf9-5dd09b481532	2024-02-25	confirmed	1200000000.00	240000000.00	960000000.00	installment	Đơn hàng VinFast VF 5 Plus cho Trần Thị Mai	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405	\N	\N
9d035558-89e5-4a9d-a6d9-1b6462f36ab4	ORD-2024-007	e22ada09-2477-41df-ac3a-85058b3fe516	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	5de1fc37-c8a6-4d87-bbf3-b2b7e3ae64f8	2024-03-01	confirmed	2400000000.00	480000000.00	1920000000.00	installment	Đơn hàng Tesla Model S Plaid	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036	\N	\N
5993dd7a-c68d-4f13-bf12-d97f4fa8b28b	ORD-2024-008	9b82e51f-30a5-4237-9a21-a7223926c08b	23c800a2-5903-4b5e-bb41-c86e0e4a5107	52b27bc0-f457-4f96-bcaf-d20daadf9f56	a23adebe-e700-451e-b1c9-e54cd8ecc242	2024-03-02	confirmed	2650000000.00	530000000.00	2120000000.00	installment	Đơn hàng Tesla Model X Plaid	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036	\N	\N
48bbd74e-ce34-4f48-9b26-eb9e0c9de16a	ORD-20251026-2558	e13dea70-2661-4527-ab52-13284fa3eff9	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	863a8f02-b9ba-4f21-bbf9-5dd09b481532	2024-12-20	cancelled	1000000000.00	0.00	\N	\N	Test order from public API\nCancellation reason: Test cancellation	2025-10-26 15:28:20.962993	2025-10-26 22:29:58.595315	\N	\N
\.


--
-- Data for Name: pricing_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_policies (policy_id, policy_name, description, policy_type, base_price, discount_percent, discount_amount, markup_percent, markup_amount, effective_date, expiry_date, min_quantity, max_quantity, customer_type, region, status, priority, created_at, updated_at, variant_id, dealer_id, scope) FROM stdin;
\.


--
-- Data for Name: pricing_policies_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_policies_backup (policy_id, policy_name, description, policy_type, base_price, discount_percent, discount_amount, markup_percent, markup_amount, effective_date, expiry_date, min_quantity, max_quantity, customer_type, region, status, priority, created_at, updated_at, variant_id) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (promotion_id, variant_id, title, description, discount_percent, discount_amount, start_date, end_date, status, created_at, updated_at) FROM stdin;
55db5285-efe6-4e12-9f6e-36919bd61bfe	1	Khuyến mãi mùa hè	Giảm giá 5% cho Tesla Model 3	5.00	\N	2024-06-01	2024-07-01	active	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
534f600d-f319-4b62-8fff-a8655c5d2430	3	Khuyến mãi mùa hè Tesla	Giảm giá 5% cho Tesla Model 3 Standard Range	5.00	\N	2024-06-01	2024-07-01	active	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
99942c2c-c1e5-4ad2-9dee-6580d286bf7f	8	Khuyến mãi VinFast VF 5	Giảm giá 10% cho VinFast VF 5 Standard	10.00	\N	2024-03-01	2024-04-01	active	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (quotation_id, quotation_number, customer_id, user_id, variant_id, color_id, quotation_date, total_price, discount_amount, final_price, validity_days, status, notes, created_at, updated_at) FROM stdin;
e13dea70-2661-4527-ab52-13284fa3eff9	QT-2024-001	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	1	1	2025-10-14	1200000000.00	20000000.00	1180000000.00	7	pending	Báo giá Tesla Model 3 Standard Range màu trắng	2025-10-14 23:14:45.443104	2025-10-20 19:13:56.50184
869777a2-80ac-4996-a9cb-d7707d4d678b	QT-2024-002	23c800a2-5903-4b5e-bb41-c86e0e4a5107	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	6	4	2025-10-14	800000000.00	0.00	800000000.00	7	pending	Báo giá BYD Atto 3 Standard màu xanh dương	2025-10-14 23:15:14.855996	2025-10-20 19:14:01.794677
2cf9b2c9-db82-40fc-9629-fcee4ddf0c8d	QT-2024-003	bc295b71-4784-42bb-8711-573b48d28101	52b27bc0-f457-4f96-bcaf-d20daadf9f56	8	1	2025-10-14	350000000.00	0.00	350000000.00	7	pending	Báo giá VinFast VF 5 Standard màu trắng	2025-10-14 23:15:14.855996	2025-10-20 19:14:07.461984
9910249d-a3bd-4e4d-a22b-c04225da94a5	QT-2024-004	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	2024-02-18	1900000000.00	100000000.00	1800000000.00	7	pending	Báo giá cho khách hàng Nguyễn Thị Thu	2025-10-14 23:18:22.035186	2025-10-20 19:14:12.781567
d3ad4833-c0b2-49dd-b40c-6040853e5772	QT-2024-005	e9c41a60-f600-4188-80fb-55fbc60ae128	52b27bc0-f457-4f96-bcaf-d20daadf9f56	11	\N	2024-02-20	2300000000.00	100000000.00	2200000000.00	7	pending	Báo giá cho khách hàng Phạm Văn Đức	2025-10-14 23:18:22.035186	2025-10-20 19:14:17.873351
5dfe0c7a-0d44-467f-b815-79adedd33f2c	QT-2024-006	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	1	2024-02-22	1250000000.00	50000000.00	1200000000.00	7	pending	Báo giá cho khách hàng Trần Thị Mai	2025-10-14 23:18:22.035186	2025-10-20 19:14:23.335086
e22ada09-2477-41df-ac3a-85058b3fe516	QT-2024-007	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	21	1	2024-03-01	2500000000.00	100000000.00	2400000000.00	7	pending	Báo giá cho Tesla Model S Plaid	2025-10-14 23:46:18.12036	2025-10-20 19:14:28.313952
9b82e51f-30a5-4237-9a21-a7223926c08b	QT-2024-008	23c800a2-5903-4b5e-bb41-c86e0e4a5107	52b27bc0-f457-4f96-bcaf-d20daadf9f56	22	3	2024-03-02	2800000000.00	150000000.00	2650000000.00	7	pending	Báo giá cho Tesla Model X Plaid	2025-10-14 23:46:18.12036	2025-10-20 19:14:35.110954
9bd78eb4-3700-48e3-8e72-84a09aaa3c9e	QT-2024-010	2d374584-fb65-472d-83a5-c1136f26bc38	52b27bc0-f457-4f96-bcaf-d20daadf9f56	24	\N	2024-03-04	2000000000.00	100000000.00	1900000000.00	7	pending	Báo giá cho BMW iX3 xDrive30	2025-10-14 23:46:18.12036	2025-10-20 19:14:40.314095
81661b71-7b3c-43bb-8171-0cd6af2762fc	QT-2024-009	80ff5c2e-f596-4638-9f14-733ae515bbeb	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	23	1	2024-03-03	1200000000.00	50000000.00	1150000000.00	7	pending	Báo giá cho BYD Atto 3 Extended Range	2025-10-14 23:46:18.12036	2025-10-20 19:14:47.996452
e913b770-4755-4375-9744-ff97ff827c7a	QUO-20251023-3448	78fe7eb0-ceb8-4793-a8af-187a3fe26f67	6f2431b7-10c9-4d61-b612-33e11b923752	1	1	2025-10-23	1200000000.00	0.00	1200000000.00	7	accepted	test	2025-10-23 10:31:25.24992	2025-10-23 10:31:25.24992
0565564e-0656-4716-a799-a57c5f7bb17c	QUO-20251023-7976	78fe7eb0-ceb8-4793-a8af-187a3fe26f67	6f2431b7-10c9-4d61-b612-33e11b923752	1	1	2025-10-23	1200000000.00	0.00	1200000000.00	7	accepted	test	2025-10-23 10:36:28.973223	2025-10-23 10:36:28.973223
\.


--
-- Data for Name: sales_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_contracts (contract_id, contract_number, order_id, customer_id, user_id, contract_date, delivery_date, contract_value, payment_terms, warranty_period_months, contract_status, signed_date, contract_file_url, contract_file_path, notes, created_at, updated_at) FROM stdin;
8a6c521b-8618-4416-ab3e-54911a58ed2a	SC-2024-001	1a242971-a5d8-41ae-9681-0b4081c6a5da	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	2024-02-16	2024-03-01	1180000000.00	Trả góp 36 tháng, lãi suất 8.5%/năm	24	signed	2024-02-16	https://example.com/contracts/SC-2024-001.pdf	\N	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
4e153212-9b59-47bb-b801-f02421a259f2	SC-2024-002	f574227f-d7c9-4145-91bd-a3b2bf409b6a	23c800a2-5903-4b5e-bb41-c86e0e4a5107	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	2024-02-17	2024-02-20	800000000.00	Thanh toán một lần	24	signed	2024-02-17	https://example.com/contracts/SC-2024-002.pdf	\N	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
db5615f4-c7f7-4b51-8098-ce1b4680297d	SC-2024-003	c6544d05-f1e6-4842-a1cc-3a6af4a873e7	\N	52b27bc0-f457-4f96-bcaf-d20daadf9f56	2024-02-18	2024-03-05	950000000.00	Trả góp 24 tháng, lãi suất 7.5%/năm	24	signed	2024-02-18	https://example.com/contracts/SC-2024-003.pdf	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186
c6b5b1af-b84f-482c-a4ee-a69a66c8ba94	SC-2024-004	1a242971-a5d8-41ae-9681-0b4081c6a5da	\N	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	2024-02-20	2024-03-08	1800000000.00	Trả góp 48 tháng, lãi suất 8.0%/năm	36	signed	2024-02-20	https://example.com/contracts/SC-2024-004.pdf	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405
762eaafe-5dc5-4044-887a-b2d9d9065844	SC-2024-005	1a242971-a5d8-41ae-9681-0b4081c6a5da	\N	52b27bc0-f457-4f96-bcaf-d20daadf9f56	2024-02-22	2024-03-10	2200000000.00	Trả góp 60 tháng, lãi suất 8.5%/năm	48	signed	2024-02-22	https://example.com/contracts/SC-2024-005.pdf	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405
27794eed-3af2-4b75-8c35-eabd1ee43871	SC-2024-006	1a242971-a5d8-41ae-9681-0b4081c6a5da	\N	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	2024-02-25	2024-03-15	1200000000.00	Trả góp 36 tháng, lãi suất 8.5%/năm	24	pending	\N	https://example.com/contracts/SC-2024-006.pdf	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405
879f3482-1b58-417e-8da9-7d5871e60d34	SC-2024-007	9d035558-89e5-4a9d-a6d9-1b6462f36ab4	e9c41a60-f600-4188-80fb-55fbc60ae128	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	2024-03-01	2024-03-15	2400000000.00	Trả góp 48 tháng, lãi suất 8.0%/năm	36	signed	2024-03-01	https://example.com/contracts/SC-2024-007.pdf	\N	\N	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036
32e4457e-8c48-434a-9f38-8ce4578f752c	SC-2024-008	5993dd7a-c68d-4f13-bf12-d97f4fa8b28b	23c800a2-5903-4b5e-bb41-c86e0e4a5107	52b27bc0-f457-4f96-bcaf-d20daadf9f56	2024-03-02	2024-03-16	2650000000.00	Trả góp 60 tháng, lãi suất 8.5%/năm	48	signed	2024-03-02	https://example.com/contracts/SC-2024-008.pdf	\N	\N	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036
\.


--
-- Data for Name: sales_report_by_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_report_by_staff (user_id, avg_order_value, completed_orders, completed_sales, role_id, role_name, staff_name, total_orders, total_sales) FROM stdin;
\.


--
-- Data for Name: test_drive_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_drive_schedules (schedule_id, created_at, notes, preferred_date, preferred_time, status, updated_at, customer_id, variant_id) FROM stdin;
\.


--
-- Data for Name: test_drive_schedules_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_drive_schedules_backup (schedule_id, customer_id, variant_id, preferred_date, preferred_time, status, notes, created_at, updated_at) FROM stdin;
a0bb45f0-e026-4548-ac0e-7e531a611525	23c800a2-5903-4b5e-bb41-c86e0e4a5107	1	2024-03-20	10:00:00	pending	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
ab2e7251-dcab-46e1-be82-bf42178dc8af	bc295b71-4784-42bb-8711-573b48d28101	8	2024-03-20	10:00:00	pending	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
0bbd5116-4504-4304-8a7d-fec50a78b666	0766234c-d354-476c-a8f9-200cd74f2d9e	3	2024-03-25	14:00:00	pending	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (role_id, role_name, description, created_at, permissions) FROM stdin;
1	admin	System Administrator	2025-10-14 23:14:45.443104	{"users": ["create", "read", "update", "delete"], "orders": ["create", "read", "update", "delete"], "dealers": ["create", "read", "update", "delete"], "reports": ["read"], "invoices": ["create", "read", "update", "delete"], "vehicles": ["create", "read", "update", "delete"]}
2	evm_staff	Electric Vehicle Manufacturer Staff	2025-10-14 23:14:45.443104	{"dealers": ["read", "update"], "reports": ["read"], "invoices": ["create", "read", "update"], "vehicles": ["create", "read", "update"]}
3	dealer_manager	Dealer Manager	2025-10-14 23:14:45.443104	{"users": ["read"], "orders": ["create", "read", "update"], "reports": ["read"], "invoices": ["read"], "customers": ["create", "read", "update"]}
4	dealer_staff	Dealer Staff 123	2025-10-14 23:14:45.443104	{"quotations":["read","write"],"vehicles":["read","write"],"orders":["read","write"],"customers":["read","write"]}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, email, password_hash, first_name, last_name, phone, address, date_of_birth, profile_image_url, profile_image_path, role_id, is_active, created_at, updated_at, dealer_id, role) FROM stdin;
2d9d55af-f0db-4210-b6a4-3f7ef4f72682	evm_manager	manager@evm.com	$2a$10$U6SBNWhwhkYEONC1OVGoGOAXNjtFU9YYYKpZBR4QXLH5Z1DKOgf5.	John	Smith	+84-123-456-7891	1000 Industrial Zone, District 7	\N	https://example.com/profiles/evm_manager.jpg	\N	2	t	2025-10-14 23:14:45.443104	2025-10-17 01:13:01.538323	\N	DEALER_STAFF
611d8920-389f-44c6-91b4-686c7872b8e3	dealer_mgr_hcm	manager@dealerhcm.com	$2a$10$dl0sUmoPb6A408jO/7.zx.pXO943Dv/ryvsSBhRn2WRAXEzSQi4L6	Nguyen	Van A	+84-28-123-4567	123 Nguyen Hue Street, District 1	\N	https://example.com/profiles/dealer_mgr.jpg	\N	3	t	2025-10-14 23:14:45.443104	2025-10-17 01:13:01.61009	\N	DEALER_STAFF
52b27bc0-f457-4f96-bcaf-d20daadf9f56	dealer_staff_hcm2	staff2@dealerhcm.com	$2a$10$SIdMAuN.Zpd6nbjOiFZ8p.WCJ/qQGXMKK3QGr9OXLugNjfgSjp2iu	Test	User	+84-28-123-4569	123 Nguyen Hue Street, District 1	\N	https://example.com/profiles/dealer_staff2.jpg	\N	4	f	2025-10-14 23:15:14.855996	2025-10-26 21:03:15.540679	\N	DEALER_STAFF
bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	dealer_staff_hcm1	staff1@dealerhcm.com	$2a$10$BWPsKeSaKAOFMyNeHKKLO.aHvrfrREaqTOHsiab6M6zBtgF1f9IOi	Tran	Thi B	+84-28-123-4568	123 Nguyen Hue Street, District 1	\N	https://example.com/profiles/dealer_staff.jpg	\N	4	f	2025-10-14 23:14:45.443104	2025-10-26 21:06:19.811894	\N	DEALER_STAFF
b8779c11-efef-48da-81e7-995dedcf8d30	toandd	toandd@gmail.com	$2a$10$enT8uwdggnoMdJGmM3C.YOCZxjOuj.p3x5UidZ5c1x3ZAW23x7K9O	toan	dang	0159753852	\N	\N	\N	\N	1	t	2025-10-26 14:13:28.924733	2025-10-26 14:13:28.924733	\N	DEALER_STAFF
6f2431b7-10c9-4d61-b612-33e11b923752	admin	admin@evdealer.com	$2a$10$twGkmusRXuBWmxF7.j04n.jt7BMv2W1TgcVNGiZNLAlJ68vGWU7Ne	Test	Administrator	0123456789	System Address	\N	\N	\N	1	t	2025-10-16 10:16:03.680024	2025-10-26 17:33:01.226012	\N	admin
\.


--
-- Data for Name: vehicle_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_brands (brand_id, brand_name, country, founded_year, brand_logo_url, brand_logo_path, is_active, created_at) FROM stdin;
2	BYD	China	1995	https://example.com/logos/byd-logo.png	\N	t	2025-10-14 23:14:45.443104
3	VinFast	Vietnam	2017	https://example.com/logos/vinfast-logo.png	\N	t	2025-10-14 23:15:14.855996
4	BMW	Germany	1916	https://example.com/logos/bmw-logo.png	\N	t	2025-10-14 23:15:14.855996
5	Mercedes-Benz	Germany	1926	https://example.com/logos/mercedes-logo.png	\N	t	2025-10-14 23:15:14.855996
6	Mercedes	Germany	1926	\N	\N	t	2025-10-15 00:52:56.216723
7	Toyota	Japan	1937	https://example.com/logos/toyota-logo.png	\N	t	2025-10-16 18:02:33.399626
1	Tesla	USA	2003	\N	\N	t	2025-10-14 23:14:45.443104
\.


--
-- Data for Name: vehicle_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_colors (color_id, color_name, color_code, color_swatch_url, color_swatch_path, is_active) FROM stdin;
1	Pearl White	#FFFFFF	https://example.com/colors/pearl-white-swatch.jpg	\N	t
2	Deep Blue Metallic	#1E3A8A	https://example.com/colors/deep-blue-swatch.jpg	\N	t
3	Midnight Black	#000000	https://example.com/colors/midnight-black-swatch.jpg	\N	t
4	Ocean Blue	#0066CC	https://example.com/colors/ocean-blue-swatch.jpg	\N	t
5	Forest Green	#006600	https://example.com/colors/forest-green-swatch.jpg	\N	t
6	Sunset Red	#CC0000	https://example.com/colors/sunset-red-swatch.jpg	\N	t
7	Mineral White	#F5F5F5	\N	\N	t
8	Silver Metallic	#C0C0C0	https://example.com/colors/silver-swatch.jpg	\N	t
\.


--
-- Data for Name: vehicle_deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_deliveries (delivery_id, order_id, inventory_id, customer_id, delivery_date, delivery_time, delivery_address, delivery_contact_name, delivery_contact_phone, delivery_status, delivery_notes, delivered_by, delivery_confirmation_date, customer_signature_url, customer_signature_path, created_at, updated_at, actual_delivery_date, condition, notes, scheduled_delivery_date, dealer_order_id, dealer_order_item_id) FROM stdin;
7258d184-b867-4637-8d70-7ea7235541b7	1a242971-a5d8-41ae-9681-0b4081c6a5da	863a8f02-b9ba-4f21-bbf9-5dd09b481532	e9c41a60-f600-4188-80fb-55fbc60ae128	2024-03-01	14:00:00	123 Le Loi Street, District 1, Ho Chi Minh City	Nguyen Van Minh	+84-901-234-567	scheduled	Giao xe vào buổi chiều	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	\N	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104	\N	\N	\N	\N	\N	\N
b50bf23d-4032-4dc7-ae7e-13f35812b6b7	f574227f-d7c9-4145-91bd-a3b2bf409b6a	0b519b1c-e178-4ede-8a42-688362cb3198	23c800a2-5903-4b5e-bb41-c86e0e4a5107	2024-02-20	10:00:00	456 Nguyen Trai Street, Thanh Xuan District, Hanoi	Tran Thi Lan	+84-902-345-678	completed	Giao xe thành công	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	\N	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996	\N	\N	\N	\N	\N	\N
8c435592-d7b2-4167-8a3e-5257bd94f078	c6544d05-f1e6-4842-a1cc-3a6af4a873e7	6d43eb8d-6a31-404e-abdb-9389b86e7c17	\N	2024-03-05	14:00:00	789 Tran Hung Dao Street, District 5, Ho Chi Minh City	Le Van Hoang	+84-903-456-789	scheduled	Giao xe BYD Atto 3 Standard	52b27bc0-f457-4f96-bcaf-d20daadf9f56	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:22.035186	\N	\N	\N	\N	\N	\N
36ee9421-1b34-4bdc-933e-9afeefda0f2e	1a242971-a5d8-41ae-9681-0b4081c6a5da	782dad0d-39d8-42c5-b7b7-961f4ad47372	\N	2024-03-08	10:00:00	321 Le Van Viet Street, Thu Duc City, Ho Chi Minh City	Nguyen Thi Thu	+84-904-567-890	scheduled	Giao xe BMW iX xDrive50	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405	\N	\N	\N	\N	\N	\N
79d5f0e8-f74f-4027-bd5a-7ef530318894	1a242971-a5d8-41ae-9681-0b4081c6a5da	863a8f02-b9ba-4f21-bbf9-5dd09b481532	\N	2024-03-10	16:00:00	654 Nguyen Thi Minh Khai Street, District 3, Ho Chi Minh City	Pham Van Duc	+84-905-678-901	scheduled	Giao xe Mercedes EQS 450+	52b27bc0-f457-4f96-bcaf-d20daadf9f56	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:26:46.854412	\N	\N	\N	\N	\N	\N
c414bcff-3702-44d9-bb2d-4e57631ad8f8	1a242971-a5d8-41ae-9681-0b4081c6a5da	863a8f02-b9ba-4f21-bbf9-5dd09b481532	\N	2024-03-15	09:00:00	987 Vo Van Tan Street, District 3, Ho Chi Minh City	Tran Thi Mai	+84-906-789-012	completed	Giao xe VinFast VF 5 Plus thành công	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	\N	2025-10-14 23:18:22.035186	2025-10-14 23:26:46.854412	\N	\N	\N	\N	\N	\N
303a02fc-1116-4364-9d20-982acb374d7b	9d035558-89e5-4a9d-a6d9-1b6462f36ab4	5de1fc37-c8a6-4d87-bbf3-b2b7e3ae64f8	e9c41a60-f600-4188-80fb-55fbc60ae128	2024-03-15	14:00:00	123 Le Loi Street, District 1, Ho Chi Minh City	Nguyen Van Minh	+84-901-234-567	scheduled	Giao xe Tesla Model S Plaid	bdfccab5-9e07-49c7-bb2a-9b2f69521eeb	\N	\N	\N	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036	\N	\N	\N	\N	\N	\N
2dd3fa6f-e03d-414e-a36d-677de326238a	5993dd7a-c68d-4f13-bf12-d97f4fa8b28b	a23adebe-e700-451e-b1c9-e54cd8ecc242	23c800a2-5903-4b5e-bb41-c86e0e4a5107	2024-03-16	10:00:00	456 Nguyen Trai Street, Thanh Xuan District, Hanoi	Tran Thi Lan	+84-902-345-678	scheduled	Giao xe Tesla Model X Plaid	52b27bc0-f457-4f96-bcaf-d20daadf9f56	\N	\N	\N	2025-10-14 23:46:18.12036	2025-10-14 23:46:18.12036	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: vehicle_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_inventory (inventory_id, variant_id, color_id, warehouse_id, warehouse_location, vin, chassis_number, manufacturing_date, arrival_date, status, cost_price, selling_price, vehicle_images, interior_images, exterior_images, created_at, updated_at) FROM stdin;
863a8f02-b9ba-4f21-bbf9-5dd09b481532	1	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone A - Premium	1HGBH41JXMN109186	\N	2024-01-15	2024-02-01	maintenance	1000000000.00	1200000000.00	{"main": "/uploads/inventory/main/ab7d06b6-59ef-4e1f-b651-9c3b513a5767.jpg"}	{"seats": "https://example.com/images/interior/TSL-M3-SR-01-seats.jpg", "console": "https://example.com/images/interior/TSL-M3-SR-01-console.jpg", "dashboard": "https://example.com/images/interior/TSL-M3-SR-01-dashboard.jpg"}	{"wheel": "https://example.com/images/exterior/TSL-M3-SR-01-wheel.jpg", "rear_view": "https://example.com/images/exterior/TSL-M3-SR-01-rear.jpg", "side_view": "https://example.com/images/exterior/TSL-M3-SR-01-side.jpg", "front_view": "https://example.com/images/exterior/TSL-M3-SR-01-front.jpg"}	2025-10-14 23:14:45.443104	2025-10-28 00:36:56.709961
782dad0d-39d8-42c5-b7b7-961f4ad47372	10	5	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone A - Premium	1HGBH41JXMN109190	\N	2024-02-05	2024-02-20	available	1500000000.00	1800000000.00	{"main": "https://example.com/images/vehicles/MB-EQS450-01-main.jpg", "rear": "https://example.com/images/vehicles/MB-EQS450-01-rear.jpg", "side": "https://example.com/images/vehicles/MB-EQS450-01-side.jpg", "front": "https://example.com/images/vehicles/MB-EQS450-01-front.jpg"}	{"seats": "https://example.com/images/interior/MB-EQS450-01-seats.jpg", "dashboard": "https://example.com/images/interior/MB-EQS450-01-dashboard.jpg"}	{"rear_view": "https://example.com/images/exterior/MB-EQS450-01-rear.jpg", "side_view": "https://example.com/images/exterior/MB-EQS450-01-side.jpg", "front_view": "https://example.com/images/exterior/MB-EQS450-01-front.jpg"}	2025-10-14 23:15:14.855996	2025-10-14 23:18:42.729405
d3105c40-d062-44d1-bd75-c3979af2b38f	\N	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	1HGBH41JXMN109192	\N	\N	\N	available	1000000000.00	1250000000.00	{}	{}	{}	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405
c643fb9f-6c4c-4764-8e50-d0c383baab17	2	2	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone B - Standard	1HGBH41JXMN109187	\N	2024-01-20	2024-02-05	available	700000000.00	800000000.00	{"main": "/uploads/inventory/main/15281252-d728-42c2-91b7-f4777c4ab61f.jpg"}	{"seats": "https://example.com/images/interior/TSL-MY-LR-01-seats.jpg", "console": "https://example.com/images/interior/TSL-MY-LR-01-console.jpg", "dashboard": "https://example.com/images/interior/TSL-MY-LR-01-dashboard.jpg"}	{"wheel": "https://example.com/images/exterior/TSL-MY-LR-01-wheel.jpg", "rear_view": "https://example.com/images/exterior/TSL-MY-LR-01-rear.jpg", "side_view": "https://example.com/images/exterior/TSL-MY-LR-01-side.jpg", "front_view": "https://example.com/images/exterior/TSL-MY-LR-01-front.jpg"}	2025-10-14 23:14:45.443104	2025-10-26 23:02:34.261354
6d43eb8d-6a31-404e-abdb-9389b86e7c17	8	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone C - Local	1HGBH41JXMN109189	\N	2024-02-01	2024-02-15	available	300000000.00	350000000.00	{"main": "/uploads/inventory/main/16b90d3d-21ef-47ea-9590-d60b3a470c7c.jpg"}	{"seats": "https://example.com/images/interior/BMW-IX-XDRIVE50-01-seats.jpg", "dashboard": "https://example.com/images/interior/BMW-IX-XDRIVE50-01-dashboard.jpg"}	{"rear_view": "https://example.com/images/exterior/BMW-IX-XDRIVE50-01-rear.jpg", "side_view": "https://example.com/images/exterior/BMW-IX-XDRIVE50-01-side.jpg", "front_view": "https://example.com/images/exterior/BMW-IX-XDRIVE50-01-front.jpg"}	2025-10-14 23:15:14.855996	2025-10-26 23:02:44.493198
0b519b1c-e178-4ede-8a42-688362cb3198	6	4	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone B - Standard	1HGBH41JXMN109188	\N	2024-01-25	2024-02-10	available	700000000.00	800000000.00	{"main": "/uploads/inventory/main/3fca45ca-7318-4925-8ce4-b2bdc7801dbb.png"}	{"seats": "https://example.com/images/interior/BYD-ATTO3-STD-01-seats.jpg", "dashboard": "https://example.com/images/interior/BYD-ATTO3-STD-01-dashboard.jpg"}	{"rear_view": "https://example.com/images/exterior/BYD-ATTO3-STD-01-rear.jpg", "side_view": "https://example.com/images/exterior/BYD-ATTO3-STD-01-side.jpg", "front_view": "https://example.com/images/exterior/BYD-ATTO3-STD-01-front.jpg"}	2025-10-14 23:15:14.855996	2025-10-27 00:02:39.541773
e158e831-d652-407d-9b52-891f8526bc78	11	\N	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	1HGBH41JXMN109191	\N	\N	\N	available	1800000000.00	2300000000.00	{"main": "https://example.com/images/vehicles/VF-VF5PLUS-01-main.jpg", "rear": "https://example.com/images/vehicles/VF-VF5PLUS-01-rear.jpg", "side": "https://example.com/images/vehicles/VF-VF5PLUS-01-side.jpg", "front": "https://example.com/images/vehicles/VF-VF5PLUS-01-front.jpg"}	{"seats": "https://example.com/images/interior/VF-VF5PLUS-01-seats.jpg", "dashboard": "https://example.com/images/interior/VF-VF5PLUS-01-dashboard.jpg"}	{"rear_view": "https://example.com/images/exterior/VF-VF5PLUS-01-rear.jpg", "side_view": "https://example.com/images/exterior/VF-VF5PLUS-01-side.jpg", "front_view": "https://example.com/images/exterior/VF-VF5PLUS-01-front.jpg"}	2025-10-14 23:18:22.035186	2025-10-14 23:18:42.729405
902ddb7a-b06b-44da-913b-8f13621789a8	1	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	VIN000000000001	CHASSIS001	2025-08-14	2025-09-14	available	\N	1200000000.00	\N	\N	\N	2025-10-14 16:22:48.637603	2025-10-14 16:22:48.637603
39366961-364f-42c8-8041-1db3e3477756	2	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	VIN000000000002	CHASSIS002	2025-08-14	2025-09-14	available	\N	800000000.00	\N	\N	\N	2025-10-14 16:22:48.641635	2025-10-14 16:22:48.641635
acd3552f-8c31-48f3-9bea-752f67134c41	3	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	VIN000000000003	CHASSIS003	2025-08-14	2025-09-14	available	\N	1200000000.00	\N	\N	\N	2025-10-14 16:22:48.64561	2025-10-14 16:22:48.64561
5de1fc37-c8a6-4d87-bbf3-b2b7e3ae64f8	21	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	TSL-MS-PLAID-01	\N	\N	\N	available	2000000000.00	2500000000.00	\N	\N	\N	2025-10-14 23:34:45.81764	2025-10-14 23:34:45.81764
a23adebe-e700-451e-b1c9-e54cd8ecc242	22	3	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	TSL-MX-PLAID-01	\N	\N	\N	available	2200000000.00	2800000000.00	\N	\N	\N	2025-10-14 23:34:45.81764	2025-10-14 23:34:45.81764
31f94751-180c-4e9e-9940-243257df6a8c	3	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	TSL-M3-STD-01	\N	\N	\N	available	1000000000.00	1200000000.00	\N	\N	\N	2025-10-15 00:38:33.959218	2025-10-15 00:38:33.959218
09404900-2861-4e20-8322-239e8b018210	4	3	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	\N	TSL-M3-LR-01	\N	\N	\N	available	1300000000.00	1500000000.00	\N	\N	\N	2025-10-15 00:52:56.216723	2025-10-15 00:52:56.216723
446296d6-ea95-4fe6-a0d9-8cf0f724db47	34	8	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	Zone D - Hybrid	1HGBH41JXMN109999	CHASSIS999	2024-03-01	2024-03-15	available	700000000.00	800000000.00	{"main": "https://example.com/images/vehicles/TOYOTA-PRIUS-01-main.jpg"}	{"seats": "https://example.com/images/interior/TOYOTA-PRIUS-01-seats.jpg"}	{"front": "https://example.com/images/exterior/TOYOTA-PRIUS-01-front.jpg"}	2025-10-16 18:03:43.289154	2025-10-16 18:03:43.289154
381b7b79-e88f-49ed-97a2-82cbfa16b28e	35	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	A-01-15	TEST123456789	\N	\N	\N	available	\N	1000000000.00	\N	\N	\N	2025-10-27 16:17:00.56176	2025-10-27 16:17:00.56176
f4a350c9-0f38-40ad-83ea-af90c125a0a4	38	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	A-02-20	TESTJSON123456789	CHASSIS_JSON_001	\N	\N	available	\N	1400000000.00	\N	\N	\N	2025-10-27 16:32:40.151125	2025-10-27 16:32:40.151125
7378a0a1-1b66-4e5a-96a9-7b278e61e020	42	1	bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	MAIN_WAREHOUSE-A-02	1HGCM82633A123457	RLV1X12345Y678901	\N	\N	reserved	\N	180000.00	\N	\N	\N	2025-10-27 17:22:05.318415	2025-10-27 17:22:05.318415
9ec0fdb3-274a-4b5a-a934-15d80e26d145	\N	\N	\N	MAIN_WAREHOUSE-A-01	1HGCM82633A123456	RLV1X12345Y678901	\N	\N	reserved	\N	600000000.00	\N	\N	\N	2025-10-27 17:16:33.18435	2025-10-28 00:36:43.640134
\.


--
-- Data for Name: vehicle_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_models (model_id, brand_id, model_name, model_year, vehicle_type, description, specifications, model_image_url, model_image_path, is_active, created_at) FROM stdin;
4	2	Seal	2024	sedan	BYD Seal - Premium Electric Sedan	\N	https://example.com/models/byd-seal.jpg	\N	t	2025-10-14 23:15:14.855996
6	3	VF 6	2024	suv	VinFast VF 6 - Mid-size Electric SUV	\N	https://example.com/models/vinfast-vf6.jpg	\N	t	2025-10-14 23:15:14.855996
1	1	Model 3	2024	sedan	Tesla Model 3 - Premium Electric Sedan	{"battery": {"type": "Lithium-ion", "capacity_kwh": 75, "charging_standard": "CCS2"}, "features": ["Autopilot", "Premium Interior", "Glass Roof", "Premium Audio"], "dimensions": {"width_mm": 1933, "height_mm": 1443, "length_mm": 4694, "wheelbase_mm": 2875}, "performance": {"top_speed": 225, "range_wltp": 430, "acceleration_0_100": 4.4}}	https://example.com/models/tesla-model3.jpg	\N	t	2025-10-14 23:14:45.443104
3	1	Model Y	2024	suv	Tesla Model Y - Electric SUV	{"battery": {"type": "Lithium-ion", "capacity_kwh": 60, "charging_standard": "CCS2"}, "features": ["Standard Interior", "Glass Roof", "Premium Audio"], "dimensions": {"width_mm": 1933, "height_mm": 1443, "length_mm": 4694, "wheelbase_mm": 2875}, "performance": {"top_speed": 225, "range_wltp": 430, "acceleration_0_100": 5.6}}	https://example.com/models/tesla-modely.jpg	\N	t	2025-10-14 23:15:14.855996
2	2	Atto 3	2024	suv	BYD Atto 3 - Compact Electric SUV	{"battery": {"type": "Lithium-ion", "capacity_kwh": 50, "charging_standard": "CCS2"}, "features": ["Standard Interior", "Basic Audio"], "dimensions": {"width_mm": 1850, "height_mm": 1660, "length_mm": 4385, "wheelbase_mm": 2600}, "performance": {"top_speed": 160, "range_wltp": 320, "acceleration_0_100": 7.3}}	https://example.com/models/byd-atto3.jpg	\N	t	2025-10-14 23:14:45.443104
7	4	iX	2024	suv	BMW iX - Luxury Electric SUV	{"battery": {"type": "Lithium-ion", "capacity_kwh": 105, "charging_standard": "CCS2"}, "features": ["Luxury Interior", "Panoramic Roof", "Premium Audio", "Advanced Driver Assistance"], "dimensions": {"width_mm": 1967, "height_mm": 1696, "length_mm": 4953, "wheelbase_mm": 3000}, "performance": {"top_speed": 200, "range_wltp": 630, "acceleration_0_100": 4.6}}	https://example.com/models/bmw-ix.jpg	\N	t	2025-10-14 23:15:14.855996
8	5	EQS	2024	sedan	Mercedes EQS - Luxury Electric Sedan	{"battery": {"type": "Lithium-ion", "capacity_kwh": 90, "charging_standard": "CCS2"}, "features": ["Luxury Interior", "Panoramic Roof", "Premium Audio", "Advanced Driver Assistance"], "dimensions": {"width_mm": 1959, "height_mm": 1518, "length_mm": 5125, "wheelbase_mm": 3210}, "performance": {"top_speed": 210, "range_wltp": 580, "acceleration_0_100": 6.2}}	https://example.com/models/mercedes-eqs.jpg	\N	t	2025-10-14 23:15:14.855996
5	3	VF 5	2024	suv	VinFast VF 5 - Compact Electric SUV	{"battery": {"type": "Lithium-ion", "capacity_kwh": 42, "charging_standard": "CCS2"}, "features": ["Standard Interior", "Basic Audio"], "dimensions": {"width_mm": 1713, "height_mm": 1613, "length_mm": 3965, "wheelbase_mm": 2500}, "performance": {"top_speed": 130, "range_wltp": 300, "acceleration_0_100": 8.5}}	https://example.com/models/vinfast-vf5.jpg	\N	t	2025-10-14 23:15:14.855996
11	1	Model S	2024	Sedan	Tesla Model S - Luxury Electric Sedan	\N	\N	\N	t	2025-10-14 23:34:45.81764
12	1	Model X	2024	SUV	Tesla Model X - Luxury Electric SUV	\N	\N	\N	t	2025-10-14 23:34:45.81764
13	2	Atto 3 Extended	2024	SUV	BYD Atto 3 Extended Range	\N	\N	\N	t	2025-10-14 23:46:18.12036
14	4	iX3	2024	SUV	BMW iX3 Electric SUV	\N	\N	\N	t	2025-10-14 23:46:18.12036
15	\N	EQC	2024	SUV	Mercedes EQC Electric SUV	\N	\N	\N	t	2025-10-14 23:46:18.12036
16	3	VF 8	2024	SUV	VinFast VF 8 Electric SUV	\N	\N	\N	t	2025-10-14 23:46:18.12036
17	4	i3	2024	Hatchback	BMW i3 - Electric Hatchback	\N	\N	\N	t	2025-10-14 23:55:04.597762
18	\N	EQS	2024	Sedan	Mercedes EQS - Luxury Electric Sedan	\N	\N	\N	t	2025-10-14 23:55:04.597762
19	3	VF 9	2024	SUV	VinFast VF 9 - Electric SUV	\N	\N	\N	t	2025-10-14 23:55:04.597762
21	7	Prius	2024	Hybrid	Toyota Prius - Hybrid Electric Vehicle	\N	\N	\N	t	2025-10-16 18:02:48.193653
\.


--
-- Data for Name: vehicle_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_variants (variant_id, model_id, variant_name, battery_capacity, range_km, power_kw, acceleration_0_100, top_speed, charging_time_fast, charging_time_slow, price_base, variant_image_url, variant_image_path, is_active, created_at) FROM stdin;
1	1	Standard Range	60.00	430	220.00	\N	\N	\N	\N	1200000000.00	https://example.com/variants/tesla-model3-standard.jpg	\N	t	2025-10-14 23:14:45.443104
2	2	Standard	50.10	480	150.00	\N	\N	\N	\N	800000000.00	https://example.com/variants/byd-atto3-standard.jpg	\N	t	2025-10-14 23:14:45.443104
3	1	Model 3 Standard Range	60.00	430	220.00	\N	\N	\N	\N	1200000000.00	https://example.com/variants/tesla-model3-standard.jpg	\N	t	2025-10-14 23:15:14.855996
4	1	Model 3 Long Range	75.00	560	283.00	\N	\N	\N	\N	1400000000.00	https://example.com/variants/tesla-model3-longrange.jpg	\N	t	2025-10-14 23:15:14.855996
5	3	Model Y Standard Range	60.00	455	220.00	\N	\N	\N	\N	1300000000.00	https://example.com/variants/tesla-modely-standard.jpg	\N	t	2025-10-14 23:15:14.855996
6	2	Atto 3 Standard	50.10	480	150.00	\N	\N	\N	\N	800000000.00	https://example.com/variants/byd-atto3-standard.jpg	\N	t	2025-10-14 23:15:14.855996
7	4	Seal Standard	61.40	550	150.00	\N	\N	\N	\N	1000000000.00	https://example.com/variants/byd-seal-standard.jpg	\N	t	2025-10-14 23:15:14.855996
8	5	VF 5 Standard	37.20	300	110.00	\N	\N	\N	\N	350000000.00	https://example.com/variants/vinfast-vf5-standard.jpg	\N	t	2025-10-14 23:15:14.855996
9	6	VF 6 Standard	42.00	350	150.00	\N	\N	\N	\N	450000000.00	https://example.com/variants/vinfast-vf6-standard.jpg	\N	t	2025-10-14 23:15:14.855996
10	7	iX xDrive40	76.60	425	240.00	\N	\N	\N	\N	1800000000.00	https://example.com/variants/bmw-ix-xdrive40.jpg	\N	t	2025-10-14 23:15:14.855996
11	8	EQS 450+	107.80	770	245.00	\N	\N	\N	\N	2000000000.00	https://example.com/variants/mercedes-eqs-450plus.jpg	\N	t	2025-10-14 23:15:14.855996
12	1	Standard Range	60.00	358	\N	5.60	225	8	\N	1200000000.00	\N	\N	t	2025-10-14 16:23:27.425866
13	1	Long Range	75.00	602	\N	4.40	233	10	\N	1500000000.00	\N	\N	t	2025-10-14 16:23:27.438832
14	3	Standard Range	60.00	455	\N	5.00	217	8	\N	1400000000.00	\N	\N	t	2025-10-14 16:23:27.440832
15	1	Standard Range	60.00	358	\N	5.60	225	8	\N	1200000000.00	\N	\N	t	2025-10-14 16:27:47.286627
16	1	Long Range	75.00	602	\N	4.40	233	10	\N	1500000000.00	\N	\N	t	2025-10-14 16:27:47.291164
17	3	Standard Range	60.00	455	\N	5.00	217	8	\N	1400000000.00	\N	\N	t	2025-10-14 16:27:47.292743
18	1	Standard Range	60.00	358	\N	5.60	225	8	\N	1200000000.00	\N	\N	t	2025-10-14 16:30:50.235328
19	1	Long Range	75.00	602	\N	4.40	233	10	\N	1500000000.00	\N	\N	t	2025-10-14 16:30:50.23784
20	3	Standard Range	60.00	455	\N	5.00	217	8	\N	1400000000.00	\N	\N	t	2025-10-14 16:30:50.239846
21	11	Model S Plaid	100.00	600	750.00	2.10	322	15	360	2500000000.00	\N	\N	t	2025-10-14 23:34:45.81764
22	12	Model X Plaid	100.00	560	750.00	2.60	262	15	360	2800000000.00	\N	\N	t	2025-10-14 23:34:45.81764
23	13	Atto 3 Extended Range	60.00	480	150.00	7.30	160	30	480	1200000000.00	\N	\N	t	2025-10-14 23:46:18.12036
24	14	iX3 xDrive30	80.00	460	210.00	6.80	180	32	450	2000000000.00	\N	\N	t	2025-10-14 23:46:18.12036
25	\N	EQC 400	80.00	417	300.00	5.10	180	40	480	2400000000.00	\N	\N	t	2025-10-14 23:46:18.12036
26	16	VF 8 Plus	87.70	471	300.00	5.50	200	35	420	1500000000.00	\N	\N	t	2025-10-14 23:46:18.12036
27	3	Model Y Long Range	75.00	480	330.00	5.00	217	25	300	1800000000.00	\N	\N	t	2025-10-14 23:55:04.597762
28	17	i3 120Ah	42.20	310	125.00	7.30	150	35	420	1000000000.00	\N	\N	t	2025-10-14 23:55:04.597762
29	\N	EQS 450+	107.80	770	245.00	6.20	210	31	420	2500000000.00	\N	\N	t	2025-10-14 23:55:04.597762
30	19	VF 9 Eco	92.00	438	300.00	6.50	200	35	420	1800000000.00	\N	\N	t	2025-10-14 23:55:04.597762
31	1	Standard Range	60.00	358	\N	5.60	225	8	\N	1200000000.00	\N	\N	t	2025-10-14 17:06:31.856392
32	1	Long Range	75.00	602	\N	4.40	233	10	\N	1500000000.00	\N	\N	t	2025-10-14 17:06:31.873634
33	3	Standard Range	60.00	455	\N	5.00	217	8	\N	1400000000.00	\N	\N	t	2025-10-14 17:06:31.875671
34	21	Prius Hybrid	1.30	1000	90.00	10.40	180	0	0	800000000.00	\N	\N	t	2025-10-16 18:03:05.560655
35	1	Test Variant	\N	\N	\N	\N	\N	\N	\N	1000000000.00	\N	\N	t	2025-10-27 16:16:50.155222
36	1	Test Variant	\N	\N	\N	\N	\N	\N	\N	1000000000.00	\N	\N	t	2025-10-27 16:22:57.395584
37	1	Test Product Variant	\N	\N	\N	\N	\N	\N	\N	1000000000.00	\N	\N	t	2025-10-27 16:23:09.088783
38	1	Model 3 Long Range JSON	75.00	560	283.00	4.20	225	15	360	1400000000.00	\N	\N	t	2025-10-27 16:32:40.137952
39	2	test 	82.00	500	300.00	3.00	260	25	6	500000000.00	\N	\N	t	2025-10-27 17:16:33.182349
42	2	test 2	82.00	500	300.00	3.00	260	25	6	1800000000.00	\N	\N	t	2025-10-27 17:22:05.317385
\.


--
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_code, address, city, province, postal_code, phone, email, capacity, is_active, created_at, updated_at) FROM stdin;
bf6844aa-e6d6-4d13-aef2-b2b0aa1a8a5a	EV Main Warehouse	MAIN_WAREHOUSE	1000 Industrial Zone, District 7	Ho Chi Minh City	Ho Chi Minh	\N	+84-28-999-0000	warehouse@evm.com	\N	t	2025-10-14 23:14:45.443104	2025-10-14 23:14:45.443104
327d9ece-ebf8-48cb-96e2-68bf264df4dc	Hanoi Warehouse	HN_WAREHOUSE	500 Industrial Zone, Long Bien	Hanoi	Hanoi	\N	+84-24-999-0000	warehouse.hn@evm.com	800	t	2025-10-14 23:15:14.855996	2025-10-14 23:15:14.855996
6c43d089-8da5-49fa-b521-aac2e094b964	HCM Warehouse	HCM-001	789 Nguyen Van Linh Street, District 7	Ho Chi Minh City	Ho Chi Minh	\N	+84-903-456-789	warehouse@evdealer.com	\N	t	2025-10-15 00:52:56.216723	2025-10-15 00:52:56.216723
\.


--
-- Name: user_roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_role_id_seq', 7, true);


--
-- Name: vehicle_brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_brands_brand_id_seq', 7, true);


--
-- Name: vehicle_colors_color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_colors_color_id_seq', 8, true);


--
-- Name: vehicle_models_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_models_model_id_seq', 21, true);


--
-- Name: vehicle_variants_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_variants_variant_id_seq', 42, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- Name: customer_debt_report customer_debt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_debt_report
    ADD CONSTRAINT customer_debt_report_pkey PRIMARY KEY (customer_id);


--
-- Name: customer_feedbacks customer_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_feedbacks
    ADD CONSTRAINT customer_feedbacks_pkey PRIMARY KEY (feedback_id);


--
-- Name: customer_payments customer_payments_payment_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_payment_number_key UNIQUE (payment_number);


--
-- Name: customer_payments customer_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_pkey PRIMARY KEY (payment_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: dealer_contracts dealer_contracts_contract_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_contracts
    ADD CONSTRAINT dealer_contracts_contract_number_key UNIQUE (contract_number);


--
-- Name: dealer_contracts dealer_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_contracts
    ADD CONSTRAINT dealer_contracts_pkey PRIMARY KEY (contract_id);


--
-- Name: dealer_discount_policies dealer_discount_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_discount_policies
    ADD CONSTRAINT dealer_discount_policies_pkey PRIMARY KEY (policy_id);


--
-- Name: dealer_installment_plans dealer_installment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_installment_plans
    ADD CONSTRAINT dealer_installment_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: dealer_installment_schedules dealer_installment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_installment_schedules
    ADD CONSTRAINT dealer_installment_schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: dealer_invoices dealer_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_invoices
    ADD CONSTRAINT dealer_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: dealer_invoices dealer_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_invoices
    ADD CONSTRAINT dealer_invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: dealer_order_items dealer_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_order_items
    ADD CONSTRAINT dealer_order_items_pkey PRIMARY KEY (item_id);


--
-- Name: dealer_orders dealer_orders_dealer_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_orders
    ADD CONSTRAINT dealer_orders_dealer_order_number_key UNIQUE (dealer_order_number);


--
-- Name: dealer_orders dealer_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_orders
    ADD CONSTRAINT dealer_orders_pkey PRIMARY KEY (dealer_order_id);


--
-- Name: dealer_payments dealer_payments_payment_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_payments
    ADD CONSTRAINT dealer_payments_payment_number_key UNIQUE (payment_number);


--
-- Name: dealer_payments dealer_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_payments
    ADD CONSTRAINT dealer_payments_pkey PRIMARY KEY (payment_id);


--
-- Name: dealer_performance_report dealer_performance_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_performance_report
    ADD CONSTRAINT dealer_performance_report_pkey PRIMARY KEY (target_id);


--
-- Name: dealer_targets dealer_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_targets
    ADD CONSTRAINT dealer_targets_pkey PRIMARY KEY (target_id);


--
-- Name: dealers dealers_dealer_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_dealer_code_key UNIQUE (dealer_code);


--
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (dealer_id);


--
-- Name: delivery_tracking_report delivery_tracking_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tracking_report
    ADD CONSTRAINT delivery_tracking_report_pkey PRIMARY KEY (delivery_id);


--
-- Name: installment_plans installment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT installment_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: installment_schedules installment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_schedules
    ADD CONSTRAINT installment_schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: inventory_turnover_report inventory_turnover_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_turnover_report
    ADD CONSTRAINT inventory_turnover_report_pkey PRIMARY KEY (brand_name);


--
-- Name: monthly_sales_summary monthly_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_sales_summary
    ADD CONSTRAINT monthly_sales_summary_pkey PRIMARY KEY (sales_year);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: pricing_policies pricing_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_policies
    ADD CONSTRAINT pricing_policies_pkey PRIMARY KEY (policy_id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (promotion_id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (quotation_id);


--
-- Name: quotations quotations_quotation_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_key UNIQUE (quotation_number);


--
-- Name: sales_contracts sales_contracts_contract_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_contracts
    ADD CONSTRAINT sales_contracts_contract_number_key UNIQUE (contract_number);


--
-- Name: sales_contracts sales_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_contracts
    ADD CONSTRAINT sales_contracts_pkey PRIMARY KEY (contract_id);


--
-- Name: sales_report_by_staff sales_report_by_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_report_by_staff
    ADD CONSTRAINT sales_report_by_staff_pkey PRIMARY KEY (user_id);


--
-- Name: test_drive_schedules test_drive_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_drive_schedules
    ADD CONSTRAINT test_drive_schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: vehicle_models ukgexpl1erlcv1p14voml8ytdv; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT ukgexpl1erlcv1p14voml8ytdv UNIQUE (brand_id, model_name, model_year);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (role_id);


--
-- Name: user_roles user_roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_name_key UNIQUE (role_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vehicle_brands vehicle_brands_brand_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands
    ADD CONSTRAINT vehicle_brands_brand_name_key UNIQUE (brand_name);


--
-- Name: vehicle_brands vehicle_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands
    ADD CONSTRAINT vehicle_brands_pkey PRIMARY KEY (brand_id);


--
-- Name: vehicle_colors vehicle_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_colors
    ADD CONSTRAINT vehicle_colors_pkey PRIMARY KEY (color_id);


--
-- Name: vehicle_deliveries vehicle_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT vehicle_deliveries_pkey PRIMARY KEY (delivery_id);


--
-- Name: vehicle_inventory vehicle_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_inventory
    ADD CONSTRAINT vehicle_inventory_pkey PRIMARY KEY (inventory_id);


--
-- Name: vehicle_inventory vehicle_inventory_vin_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_inventory
    ADD CONSTRAINT vehicle_inventory_vin_key UNIQUE (vin);


--
-- Name: vehicle_models vehicle_models_brand_id_model_name_model_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_brand_id_model_name_model_year_key UNIQUE (brand_id, model_name, model_year);


--
-- Name: vehicle_models vehicle_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_pkey PRIMARY KEY (model_id);


--
-- Name: vehicle_variants vehicle_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_variants
    ADD CONSTRAINT vehicle_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- Name: idx_appointments_status_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status_date ON public.appointments USING btree (status, appointment_date);


--
-- Name: idx_appointments_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_type ON public.appointments USING btree (appointment_type);


--
-- Name: idx_appointments_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_variant ON public.appointments USING btree (variant_id);


--
-- Name: idx_appointments_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_variant_id ON public.appointments USING btree (variant_id);


--
-- Name: idx_appointments_variant_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_variant_type ON public.appointments USING btree (variant_id, appointment_type);


--
-- Name: idx_customer_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_payments_order_id ON public.customer_payments USING btree (order_id);


--
-- Name: idx_customer_payments_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_payments_payment_date ON public.customer_payments USING btree (payment_date);


--
-- Name: idx_customer_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_payments_status ON public.customer_payments USING btree (status);


--
-- Name: idx_customers_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);


--
-- Name: idx_dealer_contracts_contract_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_contracts_contract_status ON public.dealer_contracts USING btree (contract_status);


--
-- Name: idx_dealer_contracts_contract_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_contracts_contract_type ON public.dealer_contracts USING btree (contract_type);


--
-- Name: idx_dealer_contracts_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_contracts_end_date ON public.dealer_contracts USING btree (end_date);


--
-- Name: idx_dealer_contracts_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_contracts_start_date ON public.dealer_contracts USING btree (start_date);


--
-- Name: idx_dealer_order_items_color_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_order_items_color_id ON public.dealer_order_items USING btree (color_id);


--
-- Name: idx_dealer_order_items_dealer_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_order_items_dealer_order_id ON public.dealer_order_items USING btree (dealer_order_id);


--
-- Name: idx_dealer_order_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_order_items_status ON public.dealer_order_items USING btree (status);


--
-- Name: idx_dealer_order_items_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_order_items_variant_id ON public.dealer_order_items USING btree (variant_id);


--
-- Name: idx_dealer_orders_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_orders_approval_status ON public.dealer_orders USING btree (approval_status);


--
-- Name: idx_dealer_orders_approved_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_orders_approved_by ON public.dealer_orders USING btree (approved_by);


--
-- Name: idx_dealer_orders_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_orders_dealer_id ON public.dealer_orders USING btree (dealer_id);


--
-- Name: idx_dealer_orders_order_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_orders_order_type ON public.dealer_orders USING btree (order_type);


--
-- Name: idx_dealer_payments_invoice_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_payments_invoice_id ON public.dealer_payments USING btree (invoice_id);


--
-- Name: idx_dealer_targets_dealer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_dealer ON public.dealer_targets USING btree (dealer_id);


--
-- Name: idx_dealer_targets_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_dealer_id ON public.dealer_targets USING btree (dealer_id);


--
-- Name: idx_dealer_targets_dealer_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_dealer_scope ON public.dealer_targets USING btree (dealer_id, target_scope);


--
-- Name: idx_dealer_targets_dealer_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_dealer_year ON public.dealer_targets USING btree (dealer_id, target_year);


--
-- Name: idx_dealer_targets_target_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_target_month ON public.dealer_targets USING btree (target_month);


--
-- Name: idx_dealer_targets_target_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_target_scope ON public.dealer_targets USING btree (target_scope);


--
-- Name: idx_dealer_targets_target_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_target_status ON public.dealer_targets USING btree (target_status);


--
-- Name: idx_dealer_targets_target_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_target_type ON public.dealer_targets USING btree (target_type);


--
-- Name: idx_dealer_targets_target_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dealer_targets_target_year ON public.dealer_targets USING btree (target_year);


--
-- Name: idx_installment_plans_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_customer_id ON public.installment_plans USING btree (customer_id);


--
-- Name: idx_installment_plans_dealer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_dealer ON public.installment_plans USING btree (dealer_id);


--
-- Name: idx_installment_plans_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_dealer_id ON public.installment_plans USING btree (dealer_id);


--
-- Name: idx_installment_plans_dealer_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_dealer_type ON public.installment_plans USING btree (dealer_id, plan_type);


--
-- Name: idx_installment_plans_invoice; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_invoice ON public.installment_plans USING btree (invoice_id);


--
-- Name: idx_installment_plans_invoice_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_invoice_id ON public.installment_plans USING btree (invoice_id);


--
-- Name: idx_installment_plans_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_order_id ON public.installment_plans USING btree (order_id);


--
-- Name: idx_installment_plans_plan_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_plan_type ON public.installment_plans USING btree (plan_type);


--
-- Name: idx_installment_plans_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_status ON public.installment_plans USING btree (plan_status);


--
-- Name: idx_installment_plans_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_status_created ON public.installment_plans USING btree (plan_status, created_at);


--
-- Name: idx_installment_plans_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_plans_type ON public.installment_plans USING btree (plan_type);


--
-- Name: idx_installment_schedules_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_schedules_due_date ON public.installment_schedules USING btree (due_date);


--
-- Name: idx_installment_schedules_plan_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_schedules_plan_id ON public.installment_schedules USING btree (plan_id);


--
-- Name: idx_installment_schedules_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installment_schedules_status ON public.installment_schedules USING btree (status);


--
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_order_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_pricing_policies_dealer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_dealer ON public.pricing_policies USING btree (dealer_id);


--
-- Name: idx_pricing_policies_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_dealer_id ON public.pricing_policies USING btree (dealer_id);


--
-- Name: idx_pricing_policies_dealer_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_dealer_scope ON public.pricing_policies USING btree (dealer_id, scope);


--
-- Name: idx_pricing_policies_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_scope ON public.pricing_policies USING btree (scope);


--
-- Name: idx_pricing_policies_status_effective; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_status_effective ON public.pricing_policies USING btree (status, effective_date);


--
-- Name: idx_pricing_policies_variant_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_policies_variant_scope ON public.pricing_policies USING btree (variant_id, scope);


--
-- Name: idx_sales_contracts_contract_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_contracts_contract_date ON public.sales_contracts USING btree (contract_date);


--
-- Name: idx_sales_contracts_contract_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_contracts_contract_status ON public.sales_contracts USING btree (contract_status);


--
-- Name: idx_sales_contracts_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_contracts_customer_id ON public.sales_contracts USING btree (customer_id);


--
-- Name: idx_sales_contracts_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_contracts_order_id ON public.sales_contracts USING btree (order_id);


--
-- Name: idx_users_dealer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_dealer ON public.users USING btree (dealer_id);


--
-- Name: idx_users_dealer_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_dealer_active ON public.users USING btree (dealer_id, is_active);


--
-- Name: idx_users_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_dealer_id ON public.users USING btree (dealer_id);


--
-- Name: idx_users_dealer_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_dealer_role ON public.users USING btree (dealer_id, role);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: idx_vehicle_deliveries_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_deliveries_customer_id ON public.vehicle_deliveries USING btree (customer_id);


--
-- Name: idx_vehicle_deliveries_delivery_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_deliveries_delivery_date ON public.vehicle_deliveries USING btree (delivery_date);


--
-- Name: idx_vehicle_deliveries_delivery_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_deliveries_delivery_status ON public.vehicle_deliveries USING btree (delivery_status);


--
-- Name: idx_vehicle_deliveries_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_deliveries_order_id ON public.vehicle_deliveries USING btree (order_id);


--
-- Name: idx_vehicle_inventory_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_inventory_status ON public.vehicle_inventory USING btree (status);


--
-- Name: idx_vehicle_inventory_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_inventory_variant_id ON public.vehicle_inventory USING btree (variant_id);


--
-- Name: idx_vehicle_inventory_vin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_inventory_vin ON public.vehicle_inventory USING btree (vin);


--
-- Name: idx_vehicle_models_brand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_models_brand_id ON public.vehicle_models USING btree (brand_id);


--
-- Name: idx_vehicle_variants_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_variants_model_id ON public.vehicle_variants USING btree (model_id);


--
-- Name: dealer_order_items trigger_update_dealer_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_dealer_order_items_updated_at BEFORE UPDATE ON public.dealer_order_items FOR EACH ROW EXECUTE FUNCTION public.update_dealer_order_items_updated_at();


--
-- Name: customer_feedbacks update_customer_feedbacks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customer_feedbacks_updated_at BEFORE UPDATE ON public.customer_feedbacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dealer_contracts update_dealer_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dealer_contracts_updated_at BEFORE UPDATE ON public.dealer_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dealer_invoices update_dealer_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dealer_invoices_updated_at BEFORE UPDATE ON public.dealer_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dealer_orders update_dealer_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dealer_orders_updated_at BEFORE UPDATE ON public.dealer_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dealer_targets update_dealer_targets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dealer_targets_updated_at BEFORE UPDATE ON public.dealer_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: promotions update_promotions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotations update_quotations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales_contracts update_sales_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sales_contracts_updated_at BEFORE UPDATE ON public.sales_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicle_deliveries update_vehicle_deliveries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vehicle_deliveries_updated_at BEFORE UPDATE ON public.vehicle_deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicle_inventory update_vehicle_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vehicle_inventory_updated_at BEFORE UPDATE ON public.vehicle_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customer_feedbacks customer_feedbacks_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_feedbacks
    ADD CONSTRAINT customer_feedbacks_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: customer_feedbacks customer_feedbacks_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_feedbacks
    ADD CONSTRAINT customer_feedbacks_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: customer_payments customer_payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: customer_payments customer_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: customer_payments customer_payments_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(user_id);


--
-- Name: dealer_invoices dealer_invoices_dealer_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_invoices
    ADD CONSTRAINT dealer_invoices_dealer_order_id_fkey FOREIGN KEY (dealer_order_id) REFERENCES public.dealer_orders(dealer_order_id);


--
-- Name: dealer_invoices dealer_invoices_evm_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_invoices
    ADD CONSTRAINT dealer_invoices_evm_staff_id_fkey FOREIGN KEY (evm_staff_id) REFERENCES public.users(user_id);


--
-- Name: dealer_orders dealer_orders_evm_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_orders
    ADD CONSTRAINT dealer_orders_evm_staff_id_fkey FOREIGN KEY (evm_staff_id) REFERENCES public.users(user_id);


--
-- Name: dealer_payments dealer_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_payments
    ADD CONSTRAINT dealer_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.dealer_invoices(invoice_id);


--
-- Name: dealer_order_items fk1v25oc0yd3idvdybnnrohvy9y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_order_items
    ADD CONSTRAINT fk1v25oc0yd3idvdybnnrohvy9y FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: appointments fk88083ngr9rv9wj4p916pj40c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk88083ngr9rv9wj4p916pj40c2 FOREIGN KEY (staff_id) REFERENCES public.users(user_id);


--
-- Name: dealer_installment_plans fk92d3eqekwmmm7fnj4a05whbc5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_installment_plans
    ADD CONSTRAINT fk92d3eqekwmmm7fnj4a05whbc5 FOREIGN KEY (invoice_id) REFERENCES public.dealer_invoices(invoice_id);


--
-- Name: dealer_discount_policies fk9k40cr9dwn2jdhhjduf4hness; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_discount_policies
    ADD CONSTRAINT fk9k40cr9dwn2jdhhjduf4hness FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: appointments fk_appointments_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_variant FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: dealer_orders fk_dealer_orders_approved_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_orders
    ADD CONSTRAINT fk_dealer_orders_approved_by FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: dealer_orders fk_dealer_orders_dealer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_orders
    ADD CONSTRAINT fk_dealer_orders_dealer FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id) ON DELETE RESTRICT;


--
-- Name: dealer_targets fk_dealer_targets_dealer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_targets
    ADD CONSTRAINT fk_dealer_targets_dealer FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id);


--
-- Name: installment_plans fk_installment_plans_dealer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT fk_installment_plans_dealer FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id);


--
-- Name: installment_plans fk_installment_plans_invoice; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT fk_installment_plans_invoice FOREIGN KEY (invoice_id) REFERENCES public.dealer_invoices(invoice_id);


--
-- Name: pricing_policies fk_pricing_policies_dealer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_policies
    ADD CONSTRAINT fk_pricing_policies_dealer FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id);


--
-- Name: users fk_users_dealer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_dealer FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id);


--
-- Name: dealer_order_items fka45g8x4aalb5jy5m5d6ty17ae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_order_items
    ADD CONSTRAINT fka45g8x4aalb5jy5m5d6ty17ae FOREIGN KEY (dealer_order_id) REFERENCES public.dealer_orders(dealer_order_id);


--
-- Name: pricing_policies fkd7eqnxkd9h9us7tj6c1q89jny; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_policies
    ADD CONSTRAINT fkd7eqnxkd9h9us7tj6c1q89jny FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: test_drive_schedules fkdgr7gp15xmlvd7adomimmw2wt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_drive_schedules
    ADD CONSTRAINT fkdgr7gp15xmlvd7adomimmw2wt FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: dealer_installment_schedules fkfr6c0gs94glrnuq9b3smnbox0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_installment_schedules
    ADD CONSTRAINT fkfr6c0gs94glrnuq9b3smnbox0 FOREIGN KEY (plan_id) REFERENCES public.dealer_installment_plans(plan_id);


--
-- Name: vehicle_deliveries fkk7d4fky5l0dayx3ds3uwv2tcf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT fkk7d4fky5l0dayx3ds3uwv2tcf FOREIGN KEY (dealer_order_id) REFERENCES public.dealer_orders(dealer_order_id);


--
-- Name: dealer_order_items fkl7qanqkf30dd24bibtcti14xp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_order_items
    ADD CONSTRAINT fkl7qanqkf30dd24bibtcti14xp FOREIGN KEY (color_id) REFERENCES public.vehicle_colors(color_id);


--
-- Name: test_drive_schedules fkn1dd9vk9aqi236u4s06n5iant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_drive_schedules
    ADD CONSTRAINT fkn1dd9vk9aqi236u4s06n5iant FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: vehicle_deliveries fkrk2p6pe3wl2b533ncwj9ac8d0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT fkrk2p6pe3wl2b533ncwj9ac8d0 FOREIGN KEY (dealer_order_item_id) REFERENCES public.dealer_order_items(item_id);


--
-- Name: appointments fkrlbb09f329sfsmftrh7y0yxtk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fkrlbb09f329sfsmftrh7y0yxtk FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: installment_plans installment_plans_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT installment_plans_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: installment_plans installment_plans_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT installment_plans_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: installment_schedules installment_schedules_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_schedules
    ADD CONSTRAINT installment_schedules_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.installment_plans(plan_id);


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: orders orders_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.vehicle_inventory(inventory_id);


--
-- Name: orders orders_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(quotation_id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: promotions promotions_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: quotations quotations_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.vehicle_colors(color_id);


--
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: quotations quotations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: quotations quotations_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: sales_contracts sales_contracts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_contracts
    ADD CONSTRAINT sales_contracts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: sales_contracts sales_contracts_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_contracts
    ADD CONSTRAINT sales_contracts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: sales_contracts sales_contracts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_contracts
    ADD CONSTRAINT sales_contracts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(role_id);


--
-- Name: vehicle_deliveries vehicle_deliveries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT vehicle_deliveries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: vehicle_deliveries vehicle_deliveries_delivered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT vehicle_deliveries_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES public.users(user_id);


--
-- Name: vehicle_deliveries vehicle_deliveries_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT vehicle_deliveries_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.vehicle_inventory(inventory_id);


--
-- Name: vehicle_deliveries vehicle_deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_deliveries
    ADD CONSTRAINT vehicle_deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: vehicle_inventory vehicle_inventory_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_inventory
    ADD CONSTRAINT vehicle_inventory_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.vehicle_colors(color_id);


--
-- Name: vehicle_inventory vehicle_inventory_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_inventory
    ADD CONSTRAINT vehicle_inventory_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.vehicle_variants(variant_id);


--
-- Name: vehicle_inventory vehicle_inventory_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_inventory
    ADD CONSTRAINT vehicle_inventory_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id);


--
-- Name: vehicle_models vehicle_models_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.vehicle_brands(brand_id);


--
-- Name: vehicle_variants vehicle_variants_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_variants
    ADD CONSTRAINT vehicle_variants_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.vehicle_models(model_id);


--
-- PostgreSQL database dump complete
--

\unrestrict u2OhGxPOqgc9aR7pS4dmh3jkZLN7EDhhxrNQrBwWQc56D7S81O6HD9MzD6ni0IF

