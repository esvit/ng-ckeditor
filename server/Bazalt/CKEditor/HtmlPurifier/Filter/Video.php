<?php

namespace Bazalt\CKEditor\HtmlPurifier\Filter;

class Video extends \HTMLPurifier_Filter
{
    public $name = 'Video';

    /**
     *
     * @param string $html
     * @param \HTMLPurifier_Config $config
     * @param \HTMLPurifier_Context $context
     * @return string
     */
    public function preFilter($html, \HTMLPurifier_Config $config, \HTMLPurifier_Context $context)
    {
        $html = preg_replace('#<iframe#i', '<img class="MyIframe"', $html);
        $html = preg_replace('#</iframe>#i', '</img>', $html);
        return $html;
    }

    /**
     *
     * @param string $html
     * @param \HTMLPurifier_Config $config
     * @param \HTMLPurifier_Context $context
     * @return string
     */
    public function postFilter($html, \HTMLPurifier_Config $config, \HTMLPurifier_Context $context)
    {
        $post_regex = '#<img class="MyIframe"([^>]+?) />#';
        return preg_replace_callback($post_regex, array($this, 'postFilterCallback'), $html);
    }

    /**
     *
     * @param array $matches
     * @return string
     */
    protected function postFilterCallback($matches)
    {
        $youTubeMatch = preg_match('#src="(https?:)?//www.youtube(-nocookie)?.com/#i', $matches[1]);
        $vimeoMatch = preg_match('#src="http://player.vimeo.com/#i', $matches[1]);
        if ($youTubeMatch || $vimeoMatch) {
            $extra = ' frameborder="0"';
            if ($youTubeMatch) {
                $extra .= ' allowfullscreen';
            } elseif ($vimeoMatch) {
                $extra .= ' webkitAllowFullScreen mozallowfullscreen allowFullScreen';
            }
            return '<iframe ' . $matches[1] . $extra . '></iframe>';
        } else {
            return '';
        }
    }
}