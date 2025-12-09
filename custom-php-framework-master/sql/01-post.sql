create table post
(
    id      integer not null
        constraint post_pk
            primary key autoincrement,
    subject text not null,
    content text not null
);
create table comment
(
    id      integer not null
        constraint comment_pk
            primary key autoincrement,
    author  text not null,
    content text not null
);