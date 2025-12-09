<?php

/** @var \App\Model\Comment $comment */
/** @var \App\Service\Router $router */

$title = 'Create Comment';
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Create Comment</h1>

    <form action="<?= $router->generatePath('comment-create') ?>" method="post">
        <label for="author">Author</label>
        <input type="text" id="author" name="post[author]" required>

        <label for="content">Content</label>
        <textarea id="content" name="post[content]" required></textarea>

        <input type="submit" value="Create">
    </form>

    <a href="<?= $router->generatePath('comment-index') ?>">Back to list</a>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';