DROP DATABASE IF EXISTS gro_bro;

DROP USER IF EXISTS gro_bro_user;

CREATE USER gro_bro_user WITH ENCRYPTED PASSWORD 'password';

CREATE DATABASE gro_bro WITH OWNER 'gro_bro_user';