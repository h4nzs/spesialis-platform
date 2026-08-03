-- Bump booking_number_seq CACHE from 1 to 50 to reduce
-- synchronous disk writes under concurrent booking traffic.
--
-- CACHE 1 forces a disk write on every nextval() call.
-- CACHE 50 allows PostgreSQL to pre-allocate 50 values in
-- memory per backend, dramatically improving throughput.

ALTER SEQUENCE IF EXISTS booking_number_seq CACHE 50;
