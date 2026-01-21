<?php

/** @var \App\Model\Comment $comment */
/** @var \App\Service\Router $router */

$title = 'Edit Comment';
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Edit Comment</h1>

    <form action="<?= $router->generatePath('comment-edit', ['id' => $comment->getId()]) ?>" method="post">
        <label for="author">Author</label>
        <input type="text" id="author" name="post[author]" value="<?= $comment->getAuthor() ?>" required>

        <label for="content">Content</label>
        <textarea id="content" name="post[content]" required><?= $comment->getContent() ?></textarea>

        <input type="submit" value="Update">
    </form>

    <a href="<?= $router->generatePath('comment-index') ?>">Back to list</a>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';