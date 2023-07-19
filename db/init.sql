CREATE TABLE public.users
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(500) NOT NULL,
    password character varying NOT NULL,
    create_at timestamp with time zone NOT NULL DEFAULT date_trunc('seconds', NOW()),
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);