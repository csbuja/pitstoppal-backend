CREATE DATABASE IF NOT EXISTS eecs498;
use eecs498
drop table if exists sensordata;
drop table if exists user_res;
drop table if exists restaurant;
drop table if exists user;
drop table if exists survey;
drop table if exists rate;
create table user(
	userid varchar(255) not null primary key
);

create table survey(
	userid varchar(255) not null,
	restaurant_id varchar(255) not null,
	name varchar(255),
	foodtype varchar(255),
	rate double not null,
	primary key (userid, restaurant_id),
	foreign key (userid) references user(userid) on delete cascade
);

create table rate(
	userid varchar(255) not null,
	restaurant_id varchar(255) not null,
	name varchar(255),
	foodtype varchar(255),
	rate double not null,
	primary key (userid, restaurant_id),
	foreign key (userid) references user(userid) on delete cascade
);


create table sensordata(
	userid varchar(255) not null,
	lon double,
	lat double,
	status int,
	time timestamp DEFAULT CURRENT_TIMESTAMP,
	primary key (userid, time),
	foreign key (userid) references user(userid) on delete cascade
	
);

#insert into user (userid) values (0);
#insert an root user with userid 0;