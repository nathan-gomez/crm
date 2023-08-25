CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username varchar(500) NOT NULL UNIQUE,
    password character varying NOT NULL,
    role varchar(500) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT date_trunc('seconds'::text, LOCALTIMESTAMP),
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	username varchar(500) NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT date_trunc('seconds'::text, LOCALTIMESTAMP),
    PRIMARY KEY (id)
);