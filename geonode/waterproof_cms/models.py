from django.db import models
from django.utils import translation
from django.http import HttpResponseRedirect

from wagtail.core.models import Page
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.admin.edit_handlers import MultiFieldPanel, PageChooserPanel

class TranslatablePageMixin(models.Model):
    # One link for each alternative language
    # These should only be used on the main language page (english)
    #french_link = models.ForeignKey(Page, null=True, on_delete=models.SET_NULL, blank=True, related_name='+')
    spanish_link = models.ForeignKey(Page, null=True, on_delete=models.SET_NULL, blank=True, related_name='+')

    panels = [
        #PageChooserPanel('french_link'),
        PageChooserPanel('spanish_link'),
    ]

    def get_language(self):
        """
        This returns the language code for this page.
        """
        # Look through ancestors of this page for its language homepage
        # The language homepage is located at depth 3
        language_homepage = self.get_ancestors(inclusive=True).get(depth=3)

        # The slug of language homepages should always be set to the language code
        return language_homepage.slug


    # Method to find the main language version of this page
    # This works by reversing the above links

    def english_page(self):
        """
        This finds the english version of this page
        """
        language = self.get_language()

        if language == 'en':
            return self
        elif language == 'fr':
            return type(self).objects.filter(french_link=self).first().specific
        elif language == 'es':
            return type(self).objects.filter(spanish_link=self).first().specific

    # We need a method to find a version of this page for each alternative language.
    # These all work the same way. They firstly find the main version of the page
    # (english), then from there they can just follow the link to the correct page.

   # def french_page(self):
    #    """
     #   This finds the french version of this page
      #  """
       # english_page = self.english_page()
#
 #       if english_page and english_page.french_link:
  #          return english_page.french_link.specific

    def spanish_page(self):
        """
        This finds the spanish version of this page
        """
        english_page = self.english_page()

        if english_page and english_page.spanish_link:
            return english_page.spanish_link.specific

    class Meta:
        abstract = True


class AboutPage(Page, TranslatablePageMixin):
    ...
    content_panels = [
        MultiFieldPanel(TranslatablePageMixin.panels, 'Language links')
    ]


class ContactPage(Page, TranslatablePageMixin):
    ...
    content_panels = [
        MultiFieldPanel(TranslatablePageMixin.panels, 'Language links')
    ]

class LanguageRedirectionPage(Page):

    def serve(self, request):
        # This will only return a language that is in the LANGUAGES Django setting
        language = translation.get_language_from_request(request)

        return HttpResponseRedirect(self.url + language + '/')


class HomePage(Page):
    body = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('body', classname="full"),
    ]