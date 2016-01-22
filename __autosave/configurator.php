<form class="form-plugin" action="<?php echo $config->url_current; ?>/update" method="post">
  <?php echo Form::hidden('token', $token); ?>
  <?php $autosave_config = File::open(__DIR__ . DS . 'states' . DS . 'config.txt')->unserialize(); ?>
  <?php $speak_title = (array) $speak->manager->plugin_autosave_title; ?>
  <?php $speak_description = (array) $speak->manager->plugin_autosave_description; ?>
  <label class="grid-group">
    <span class="grid span-1 form-label"><?php echo $speak_title[0] . ' ' . Jot::info($speak_description[0]); ?></span>
    <span class="grid span-5"><?php echo Form::text('interval', $autosave_config['interval'], 30); ?></span>
  </label>
  <label class="grid-group">
    <span class="grid span-1 form-label"><?php echo $speak_title[1]; ?></span>
    <span class="grid span-5"><?php echo Form::textarea('css', File::open(__DIR__ . DS . 'assets' . DS . 'shell' . DS . 'do.css')->read(), null, array('class' => array('textarea-block', 'textarea-expand', 'code'))); ?></span>
  </label>
  <div class="grid-group">
    <span class="grid span-1"></span>
    <span class="grid span-5"><?php echo Jot::button('action', $speak->update); ?></span>
  </div>
</form>