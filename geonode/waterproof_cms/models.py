from django.db import models
from django.utils import translation
from django.http import HttpResponseRedirect

from wagtail.core.models import Page
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.admin.edit_handlers import MultiFieldPanel, PageChooserPanel

class TranslatablePageMixin(models.Model):
    spanish_link = models.ForeignKey(Page, null=True, on_delete=models.SET_NULL, blank=True, related_name='+')

    panels = [
        PageChooserPanel('spanish_link'),
    ]

    def get_language(self):
        language_homepage = self.get_ancestors(inclusive=True).get(depth=3)
        return language_homepage.slug

    def english_page(self):
        language = self.get_language()

        if language == 'en':
            return self
        elif language == 'fr':
            return type(self).objects.filter(french_link=self).first().specific
        elif language == 'es':
            return type(self).objects.filter(spanish_link=self).first().specific


    def spanish_page(self):
        english_page = self.english_page()

        if english_page and english_page.spanish_link:
            return english_page.spanish_link.specific

    class Meta:
        abstract = True

# class LanguageRedirectionPage(Page):

#     def serve(self, request):
#         language = translation.get_language_from_request(request)

#         return HttpResponseRedirect(self.url + language + '/')


# class HomePage(Page):
#     body = RichTextField(blank=True)

#     content_panels = Page.content_panels + [
#         FieldPanel('body', classname="full"),
#     ]