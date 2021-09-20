from django.db import models
from django.utils import translation
from django.http import HttpResponseRedirect

from wagtail.core import blocks
from wagtail.core.models import Page
from wagtail.core.fields import RichTextField, StreamField
from wagtail.admin.edit_handlers import  MultiFieldPanel, PageChooserPanel, StreamFieldPanel, FieldPanel
from wagtail.images.blocks import ImageChooserBlock
from wagtailtrans.models import TranslatablePage

class TransHomePage(TranslatablePage):
    body = RichTextField(blank=True, default="",
            features=['h2', 'h3', 'bold', 'italic', 'link', 'ol', 'ul', 'hr', 
            'document-link', 'image', 'embed', 'code'])

    content_panels = Page.content_panels + [
        FieldPanel('body'),
    ]


class TransLandingPage(TranslatablePage):
    
    body = StreamField([
        ('heading', blocks.CharBlock(form_classname="full title", help_text="Puede agregar etiquetas html como center, h1, h2... para ajustar el encabezado")),
        ('paragraph', blocks.RichTextBlock()),
        ('image', ImageChooserBlock()),
        ('HTML', blocks.RawHTMLBlock()),
    ])

    content_panels = Page.content_panels + [
        StreamFieldPanel('body'),
    ]