--
-- PostgreSQL database dump
--

-- Dumped from database version 15.7 (Debian 15.7-1.pgdg120+1)
-- Dumped by pg_dump version 15.8 (Homebrew)
CREATE EXTENSION IF NOT EXISTS  vector;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: most_basic_chatbot; Type: DATABASE; Schema: -; Owner: postgres
--



ALTER DATABASE most_basic_chatbot OWNER TO postgres;


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chunks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chunks (
    url character varying NOT NULL,
    content text,
    embedding public.vector(1536)
);


ALTER TABLE public.chunks OWNER TO postgres;


--
-- Name: chunks chunks_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chunks
    ADD CONSTRAINT chunks_pk PRIMARY KEY (url);


--
-- PostgreSQL database dump complete
--

