# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.contrib.gis.db import models


class AccountEmailaddress(models.Model):
    email = models.CharField(unique=True, max_length=254)
    verified = models.BooleanField()
    primary = models.BooleanField()
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'account_emailaddress'


class AccountEmailconfirmation(models.Model):
    created = models.DateTimeField()
    sent = models.DateTimeField(blank=True, null=True)
    key = models.CharField(unique=True, max_length=64)
    email_address = models.ForeignKey(AccountEmailaddress, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'account_emailconfirmation'


class ActstreamAction(models.Model):
    actor_object_id = models.CharField(max_length=255)
    verb = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    target_object_id = models.CharField(max_length=255, blank=True, null=True)
    action_object_object_id = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField()
    public = models.BooleanField()
    data = models.TextField(blank=True, null=True)
    action_object_content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    actor_content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    target_content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'actstream_action'


class ActstreamFollow(models.Model):
    object_id = models.CharField(max_length=255)
    actor_only = models.BooleanField()
    started = models.DateTimeField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)
    flag = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'actstream_follow'
        unique_together = (('user', 'content_type', 'object_id', 'flag'),)


class AnnouncementsAnnouncement(models.Model):
    title = models.CharField(max_length=50)
    level = models.IntegerField()
    content = models.TextField()
    creation_date = models.DateTimeField()
    site_wide = models.BooleanField()
    members_only = models.BooleanField()
    dismissal_type = models.IntegerField()
    publish_start = models.DateTimeField()
    publish_end = models.DateTimeField(blank=True, null=True)
    creator = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'announcements_announcement'


class AnnouncementsDismissal(models.Model):
    dismissed_at = models.DateTimeField()
    announcement = models.ForeignKey(AnnouncementsAnnouncement, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'announcements_dismissal'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AvatarAvatar(models.Model):
    primary = models.BooleanField()
    avatar = models.CharField(max_length=1024)
    date_uploaded = models.DateTimeField()
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'avatar_avatar'


class BaseConfiguration(models.Model):
    read_only = models.BooleanField()
    maintenance = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'base_configuration'


class BaseContactrole(models.Model):
    role = models.CharField(max_length=255)
    contact = models.ForeignKey('PeopleProfile', models.DO_NOTHING)
    resource = models.ForeignKey('BaseResourcebase', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_contactrole'
        unique_together = (('contact', 'resource', 'role'),)


class BaseCuratedthumbnail(models.Model):
    img = models.CharField(max_length=100)
    resource = models.ForeignKey('BaseResourcebase', models.DO_NOTHING, unique=True)

    class Meta:
        managed = False
        db_table = 'base_curatedthumbnail'


class BaseGroupgeolimit(models.Model):
    wkt = models.TextField()
    group = models.ForeignKey('GroupsGroupprofile', models.DO_NOTHING)
    resource = models.ForeignKey('BaseResourcebase', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_groupgeolimit'


class BaseHierarchicalkeyword(models.Model):
    name = models.CharField(unique=True, max_length=100)
    slug = models.CharField(unique=True, max_length=100)
    path = models.CharField(unique=True, max_length=255)
    depth = models.IntegerField()
    numchild = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'base_hierarchicalkeyword'


class BaseLicense(models.Model):
    identifier = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255, blank=True, null=True)
    abbreviation = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    url = models.CharField(max_length=2000, blank=True, null=True)
    license_text = models.TextField(blank=True, null=True)
    license_text_en = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'base_license'


class BaseLink(models.Model):
    extension = models.CharField(max_length=255)
    link_type = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    mime = models.CharField(max_length=255)
    url = models.TextField()
    resource = models.ForeignKey('BaseResourcebase', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'base_link'


class BaseMenu(models.Model):
    title = models.CharField(max_length=255)
    order = models.IntegerField()
    placeholder = models.ForeignKey('BaseMenuplaceholder', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_menu'
        unique_together = (('placeholder', 'order'), ('placeholder', 'title'),)


class BaseMenuitem(models.Model):
    title = models.CharField(max_length=255)
    order = models.IntegerField()
    blank_target = models.BooleanField()
    url = models.CharField(max_length=2000)
    menu = models.ForeignKey(BaseMenu, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_menuitem'
        unique_together = (('menu', 'order'), ('menu', 'title'),)


class BaseMenuplaceholder(models.Model):
    name = models.CharField(unique=True, max_length=255)

    class Meta:
        managed = False
        db_table = 'base_menuplaceholder'


class BaseRegion(models.Model):
    code = models.CharField(unique=True, max_length=50)
    name = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255, blank=True, null=True)
    lft = models.IntegerField()
    rght = models.IntegerField()
    tree_id = models.IntegerField()
    level = models.IntegerField()
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    bbox_x0 = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    bbox_x1 = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    bbox_y0 = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    bbox_y1 = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    srid = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'base_region'


class BaseResourcebase(models.Model):
    uuid = models.CharField(max_length=36)
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    date_type = models.CharField(max_length=255)
    edition = models.CharField(max_length=255, blank=True, null=True)
    abstract = models.TextField()
    purpose = models.TextField(blank=True, null=True)
    maintenance_frequency = models.CharField(max_length=255, blank=True, null=True)
    constraints_other = models.TextField(blank=True, null=True)
    language = models.CharField(max_length=3)
    temporal_extent_start = models.DateTimeField(blank=True, null=True)
    temporal_extent_end = models.DateTimeField(blank=True, null=True)
    supplemental_information = models.TextField()
    data_quality_statement = models.TextField(blank=True, null=True)
    srid = models.CharField(max_length=30)
    csw_typename = models.CharField(max_length=32)
    csw_schema = models.CharField(max_length=64)
    csw_mdsource = models.CharField(max_length=256)
    csw_insert_date = models.DateTimeField(blank=True, null=True)
    csw_type = models.CharField(max_length=32)
    csw_anytext = models.TextField(blank=True, null=True)
    csw_wkt_geometry = models.TextField()
    metadata_uploaded = models.BooleanField()
    metadata_xml = models.TextField(blank=True, null=True)
    popular_count = models.IntegerField()
    share_count = models.IntegerField()
    featured = models.BooleanField()
    is_published = models.BooleanField()
    thumbnail_url = models.TextField(blank=True, null=True)
    detail_url = models.CharField(max_length=255, blank=True, null=True)
    rating = models.IntegerField(blank=True, null=True)
    category = models.ForeignKey('BaseTopiccategory', models.DO_NOTHING, blank=True, null=True)
    license = models.ForeignKey(BaseLicense, models.DO_NOTHING, blank=True, null=True)
    owner = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)
    polymorphic_ctype = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    restriction_code_type = models.ForeignKey('BaseRestrictioncodetype', models.DO_NOTHING, blank=True, null=True)
    spatial_representation_type = models.ForeignKey('BaseSpatialrepresentationtype', models.DO_NOTHING, blank=True, null=True)
    metadata_uploaded_preserve = models.BooleanField()
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING, blank=True, null=True)
    alternate = models.CharField(max_length=128, blank=True, null=True)
    is_approved = models.BooleanField()
    dirty_state = models.BooleanField()
    last_updated = models.DateTimeField(blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)
    doi = models.CharField(max_length=255, blank=True, null=True)
    bbox_polygon = models.PolygonField(blank=True, null=True)
    attribution = models.CharField(max_length=2048, blank=True, null=True)
    resource_type = models.CharField(max_length=1024, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'base_resourcebase'


class BaseResourcebaseGroupsGeolimits(models.Model):
    resourcebase = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    groupgeolimit = models.ForeignKey(BaseGroupgeolimit, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_resourcebase_groups_geolimits'
        unique_together = (('resourcebase', 'groupgeolimit'),)


class BaseResourcebaseRegions(models.Model):
    resourcebase = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    region = models.ForeignKey(BaseRegion, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_resourcebase_regions'
        unique_together = (('resourcebase', 'region'),)


class BaseResourcebaseTkeywords(models.Model):
    resourcebase = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    thesauruskeyword = models.ForeignKey('BaseThesauruskeyword', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_resourcebase_tkeywords'
        unique_together = (('resourcebase', 'thesauruskeyword'),)


class BaseResourcebaseUsersGeolimits(models.Model):
    resourcebase = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    usergeolimit = models.ForeignKey('BaseUsergeolimit', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_resourcebase_users_geolimits'
        unique_together = (('resourcebase', 'usergeolimit'),)


class BaseRestrictioncodetype(models.Model):
    identifier = models.CharField(max_length=255)
    description = models.TextField()
    description_en = models.TextField(blank=True, null=True)
    gn_description = models.TextField()
    gn_description_en = models.TextField(blank=True, null=True)
    is_choice = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'base_restrictioncodetype'


class BaseSpatialrepresentationtype(models.Model):
    identifier = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    description_en = models.CharField(max_length=255, blank=True, null=True)
    gn_description = models.CharField(max_length=255)
    gn_description_en = models.CharField(max_length=255, blank=True, null=True)
    is_choice = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'base_spatialrepresentationtype'


class BaseTaggedcontentitem(models.Model):
    content_object = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    tag = models.ForeignKey(BaseHierarchicalkeyword, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_taggedcontentitem'


class BaseThesaurus(models.Model):
    identifier = models.CharField(unique=True, max_length=255)
    title = models.CharField(max_length=255)
    date = models.CharField(max_length=20)
    description = models.TextField()
    slug = models.CharField(max_length=64)
    about = models.CharField(max_length=255, blank=True, null=True)
    card_max = models.IntegerField()
    card_min = models.IntegerField()
    facet = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'base_thesaurus'


class BaseThesauruskeyword(models.Model):
    about = models.CharField(max_length=255, blank=True, null=True)
    alt_label = models.CharField(max_length=255, blank=True, null=True)
    thesaurus = models.ForeignKey(BaseThesaurus, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_thesauruskeyword'
        unique_together = (('thesaurus', 'alt_label'),)


class BaseThesauruskeywordlabel(models.Model):
    lang = models.CharField(max_length=3)
    label = models.CharField(max_length=255)
    keyword = models.ForeignKey(BaseThesauruskeyword, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_thesauruskeywordlabel'
        unique_together = (('keyword', 'lang'),)


class BaseThesauruslabel(models.Model):
    lang = models.CharField(max_length=3)
    label = models.CharField(max_length=255)
    thesaurus = models.ForeignKey(BaseThesaurus, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_thesauruslabel'
        unique_together = (('thesaurus', 'lang'),)


class BaseTopiccategory(models.Model):
    identifier = models.CharField(max_length=255)
    description = models.TextField()
    description_en = models.TextField(blank=True, null=True)
    gn_description = models.TextField(blank=True, null=True)
    gn_description_en = models.TextField(blank=True, null=True)
    is_choice = models.BooleanField()
    fa_class = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'base_topiccategory'


class BaseUsergeolimit(models.Model):
    wkt = models.TextField()
    resource = models.ForeignKey(BaseResourcebase, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'base_usergeolimit'


class BrRestoredbackup(models.Model):
    name = models.CharField(max_length=400)
    archive_md5 = models.CharField(max_length=32)
    restoration_date = models.DateTimeField()
    creation_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'br_restoredbackup'


class DialogosComment(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=255)
    website = models.CharField(max_length=255)
    object_id = models.IntegerField()
    comment = models.TextField()
    submit_date = models.DateTimeField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    public = models.BooleanField()
    author = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dialogos_comment'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class DjangoSite(models.Model):
    domain = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'django_site'


class DocumentsDocument(models.Model):
    resourcebase_ptr = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, primary_key=True)
    title_en = models.CharField(max_length=255, blank=True, null=True)
    abstract_en = models.TextField(blank=True, null=True)
    purpose_en = models.TextField(blank=True, null=True)
    constraints_other_en = models.TextField(blank=True, null=True)
    supplemental_information_en = models.TextField(blank=True, null=True)
    data_quality_statement_en = models.TextField(blank=True, null=True)
    doc_file = models.CharField(max_length=255, blank=True, null=True)
    extension = models.CharField(max_length=128, blank=True, null=True)
    doc_type = models.CharField(max_length=128, blank=True, null=True)
    doc_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'documents_document'


class DocumentsDocumentresourcelink(models.Model):
    object_id = models.IntegerField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING, blank=True, null=True)
    document = models.ForeignKey(DocumentsDocument, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'documents_documentresourcelink'


class FavoriteFavorite(models.Model):
    object_id = models.IntegerField()
    created_on = models.DateTimeField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'favorite_favorite'
        unique_together = (('user', 'content_type', 'object_id'),)


class FrequentlyEntry(models.Model):
    question = models.TextField()
    slug = models.CharField(unique=True, max_length=200)
    answer = models.TextField()
    creation_date = models.DateTimeField()
    last_view_date = models.DateTimeField()
    amount_of_views = models.IntegerField()
    fixed_position = models.IntegerField(blank=True, null=True)
    upvotes = models.IntegerField()
    downvotes = models.IntegerField()
    published = models.BooleanField()
    submitted_by = models.CharField(max_length=100)
    owner = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)
    answer_es = models.TextField()
    question_es = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'frequently_entry'


class FrequentlyEntryCategory(models.Model):
    entry = models.ForeignKey(FrequentlyEntry, models.DO_NOTHING)
    entrycategory = models.ForeignKey('FrequentlyEntrycategory', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'frequently_entry_category'
        unique_together = (('entry', 'entrycategory'),)


class FrequentlyEntrycategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=100)
    fixed_position = models.IntegerField(blank=True, null=True)
    last_rank = models.FloatField()
    name_es = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'frequently_entrycategory'


class FrequentlyFeedback(models.Model):
    remark = models.TextField()
    submission_date = models.DateTimeField()
    validation = models.CharField(max_length=1)
    entry = models.ForeignKey(FrequentlyEntry, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'frequently_feedback'


class GeoappGeostoriesGeostory(models.Model):
    geoapp_ptr = models.ForeignKey('GeoappsGeoapp', models.DO_NOTHING, primary_key=True)
    geostory_app_type = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'geoapp_geostories_geostory'


class GeoappsGeoapp(models.Model):
    resourcebase_ptr = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, primary_key=True)
    name = models.TextField(unique=True)
    zoom = models.IntegerField(blank=True, null=True)
    projection = models.CharField(max_length=32, blank=True, null=True)
    center_x = models.FloatField(blank=True, null=True)
    center_y = models.FloatField(blank=True, null=True)
    last_modified = models.DateTimeField()
    urlsuffix = models.CharField(max_length=255, blank=True, null=True)
    data = models.ForeignKey('GeoappsGeoappdata', models.DO_NOTHING, unique=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'geoapps_geoapp'


class GeoappsGeoappdata(models.Model):
    blob = models.TextField()  # This field type is a guess.
    resource = models.ForeignKey(GeoappsGeoapp, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'geoapps_geoappdata'


class GeonodeThemesGeonodethemecustomization(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    is_enabled = models.BooleanField()
    logo = models.CharField(max_length=100, blank=True, null=True)
    jumbotron_bg = models.CharField(max_length=100, blank=True, null=True)
    jumbotron_welcome_hide = models.BooleanField()
    jumbotron_welcome_title = models.CharField(max_length=255, blank=True, null=True)
    jumbotron_welcome_content = models.TextField(blank=True, null=True)
    body_color = models.CharField(max_length=10)
    navbar_color = models.CharField(max_length=10)
    jumbotron_color = models.CharField(max_length=10)
    copyright_color = models.CharField(max_length=10)
    contactus = models.BooleanField()
    copyright = models.TextField(blank=True, null=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    contact_position = models.CharField(max_length=255, blank=True, null=True)
    contact_administrative_area = models.CharField(max_length=255, blank=True, null=True)
    contact_street = models.CharField(max_length=255, blank=True, null=True)
    contact_postal_code = models.CharField(max_length=255, blank=True, null=True)
    contact_city = models.CharField(max_length=255, blank=True, null=True)
    contact_country = models.CharField(max_length=255, blank=True, null=True)
    contact_delivery_point = models.CharField(max_length=255, blank=True, null=True)
    contact_voice = models.CharField(max_length=255, blank=True, null=True)
    contact_facsimile = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.CharField(max_length=255, blank=True, null=True)
    partners_title = models.CharField(max_length=100, blank=True, null=True)
    jumbotron_cta_hide = models.BooleanField()
    jumbotron_cta_link = models.CharField(max_length=255, blank=True, null=True)
    jumbotron_cta_text = models.CharField(max_length=255, blank=True, null=True)
    cookie_law_info_accept_close_reload = models.CharField(max_length=30)
    cookie_law_info_animate_speed_hide = models.CharField(max_length=30)
    cookie_law_info_animate_speed_show = models.CharField(max_length=30)
    cookie_law_info_as_popup = models.CharField(max_length=30)
    cookie_law_info_background = models.CharField(max_length=30)
    cookie_law_info_bar_enabled = models.BooleanField()
    cookie_law_info_bar_head = models.TextField()
    cookie_law_info_bar_heading_text = models.CharField(max_length=30)
    cookie_law_info_bar_text = models.TextField()
    cookie_law_info_border = models.CharField(max_length=30)
    cookie_law_info_border_on = models.CharField(max_length=30)
    cookie_law_info_button_1_as_button = models.CharField(max_length=30)
    cookie_law_info_button_1_button_colour = models.CharField(max_length=30)
    cookie_law_info_button_1_button_hover = models.CharField(max_length=30)
    cookie_law_info_button_1_link_colour = models.CharField(max_length=30)
    cookie_law_info_button_1_new_win = models.CharField(max_length=30)
    cookie_law_info_button_2_as_button = models.CharField(max_length=30)
    cookie_law_info_button_2_button_colour = models.CharField(max_length=30)
    cookie_law_info_button_2_button_hover = models.CharField(max_length=30)
    cookie_law_info_button_2_hidebar = models.CharField(max_length=30)
    cookie_law_info_button_2_link_colour = models.CharField(max_length=30)
    cookie_law_info_button_3_as_button = models.CharField(max_length=30)
    cookie_law_info_button_3_button_colour = models.CharField(max_length=30)
    cookie_law_info_button_3_button_hover = models.CharField(max_length=30)
    cookie_law_info_button_3_link_colour = models.CharField(max_length=30)
    cookie_law_info_button_3_new_win = models.CharField(max_length=30)
    cookie_law_info_button_4_as_button = models.CharField(max_length=30)
    cookie_law_info_button_4_button_colour = models.CharField(max_length=30)
    cookie_law_info_button_4_button_hover = models.CharField(max_length=30)
    cookie_law_info_button_4_link_colour = models.CharField(max_length=30)
    cookie_law_info_cookie_bar_as = models.CharField(max_length=30)
    cookie_law_info_font_family = models.CharField(max_length=30)
    cookie_law_info_header_fix = models.CharField(max_length=30)
    cookie_law_info_leave_url = models.TextField()
    cookie_law_info_logging_on = models.CharField(max_length=30)
    cookie_law_info_notify_animate_hide = models.CharField(max_length=30)
    cookie_law_info_notify_animate_show = models.CharField(max_length=30)
    cookie_law_info_notify_div_id = models.CharField(max_length=30)
    cookie_law_info_notify_position_horizontal = models.CharField(max_length=30)
    cookie_law_info_notify_position_vertical = models.CharField(max_length=30)
    cookie_law_info_popup_overlay = models.CharField(max_length=30)
    cookie_law_info_popup_showagain_position = models.CharField(max_length=30)
    cookie_law_info_reject_close_reload = models.CharField(max_length=30)
    cookie_law_info_scroll_close = models.CharField(max_length=30)
    cookie_law_info_scroll_close_reload = models.CharField(max_length=30)
    cookie_law_info_show_once = models.CharField(max_length=30)
    cookie_law_info_show_once_yn = models.CharField(max_length=30)
    cookie_law_info_showagain_background = models.CharField(max_length=30)
    cookie_law_info_showagain_border = models.CharField(max_length=30)
    cookie_law_info_showagain_div_id = models.CharField(max_length=30)
    cookie_law_info_showagain_head = models.TextField()
    cookie_law_info_showagain_tab = models.CharField(max_length=30)
    cookie_law_info_showagain_x_position = models.CharField(max_length=30)
    cookie_law_info_text = models.CharField(max_length=30)
    cookie_law_info_widget_position = models.CharField(max_length=30)
    cookie_law_info_data_controller = models.TextField()
    cookie_law_info_data_controller_address = models.TextField()
    cookie_law_info_data_controller_email = models.TextField()
    cookie_law_info_data_controller_phone = models.TextField()
    navbar_dropdown_menu = models.CharField(max_length=10)
    navbar_dropdown_menu_divider = models.CharField(max_length=10)
    navbar_dropdown_menu_hover = models.CharField(max_length=10)
    navbar_dropdown_menu_text = models.CharField(max_length=10)
    navbar_text_color = models.CharField(max_length=10)
    navbar_text_hover = models.CharField(max_length=10)
    navbar_text_hover_focus = models.CharField(max_length=10)
    body_text_color = models.CharField(max_length=10)
    jumbotron_text_color = models.CharField(max_length=10)
    jumbotron_title_color = models.CharField(max_length=10)
    footer_href_color = models.CharField(max_length=10)
    footer_text_color = models.CharField(max_length=10)
    search_bg_color = models.CharField(max_length=10)
    search_link_color = models.CharField(max_length=10)
    search_title_color = models.CharField(max_length=10)
    footer_bg_color = models.CharField(max_length=10)
    welcome_theme = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'geonode_themes_geonodethemecustomization'


class GeonodeThemesGeonodethemecustomizationJumbotronSlideShow(models.Model):
    geonodethemecustomization = models.ForeignKey(GeonodeThemesGeonodethemecustomization, models.DO_NOTHING)
    jumbotronthemeslide = models.ForeignKey('GeonodeThemesJumbotronthemeslide', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'geonode_themes_geonodethemecustomization_jumbotron_slide_show'
        unique_together = (('geonodethemecustomization', 'jumbotronthemeslide'),)


class GeonodeThemesGeonodethemecustomizationPartners(models.Model):
    geonodethemecustomization = models.ForeignKey(GeonodeThemesGeonodethemecustomization, models.DO_NOTHING)
    partner = models.ForeignKey('GeonodeThemesPartner', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'geonode_themes_geonodethemecustomization_partners'
        unique_together = (('geonodethemecustomization', 'partner'),)


class GeonodeThemesJumbotronthemeslide(models.Model):
    slide_name = models.CharField(unique=True, max_length=255)
    jumbotron_slide_image = models.CharField(max_length=100)
    jumbotron_slide_content = models.TextField(blank=True, null=True)
    hide_jumbotron_slide_content = models.BooleanField()
    is_enabled = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'geonode_themes_jumbotronthemeslide'


class GeonodeThemesPartner(models.Model):
    logo = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    href = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'geonode_themes_partner'


class GroupsGroupcategory(models.Model):
    slug = models.CharField(unique=True, max_length=255)
    name = models.CharField(unique=True, max_length=255)
    name_en = models.CharField(unique=True, max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups_groupcategory'


class GroupsGroupmember(models.Model):
    role = models.CharField(max_length=10)
    joined = models.DateTimeField()
    group = models.ForeignKey('GroupsGroupprofile', models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'groups_groupmember'


class GroupsGroupprofile(models.Model):
    title = models.CharField(max_length=1000)
    slug = models.CharField(unique=True, max_length=1000)
    logo = models.CharField(max_length=100)
    description = models.TextField()
    email = models.CharField(max_length=254, blank=True, null=True)
    access = models.CharField(max_length=15)
    last_modified = models.DateTimeField(blank=True, null=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING, unique=True)
    description_en = models.TextField(blank=True, null=True)
    title_en = models.CharField(max_length=1000, blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups_groupprofile'


class GroupsGroupprofileCategories(models.Model):
    groupprofile = models.ForeignKey(GroupsGroupprofile, models.DO_NOTHING)
    groupcategory = models.ForeignKey(GroupsGroupcategory, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'groups_groupprofile_categories'
        unique_together = (('groupprofile', 'groupcategory'),)


class GuardianGroupobjectpermission(models.Model):
    object_pk = models.CharField(max_length=255)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'guardian_groupobjectpermission'
        unique_together = (('group', 'permission', 'object_pk'),)


class GuardianUserobjectpermission(models.Model):
    object_pk = models.CharField(max_length=255)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'guardian_userobjectpermission'
        unique_together = (('user', 'permission', 'object_pk'),)


class InvitationsInvitation(models.Model):
    email = models.CharField(unique=True, max_length=254)
    accepted = models.BooleanField()
    created = models.DateTimeField()
    key = models.CharField(unique=True, max_length=64)
    sent = models.DateTimeField(blank=True, null=True)
    inviter = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'invitations_invitation'


class JetBookmark(models.Model):
    url = models.CharField(max_length=200)
    title = models.CharField(max_length=255)
    user = models.IntegerField()
    date_add = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'jet_bookmark'


class JetPinnedapplication(models.Model):
    app_label = models.CharField(max_length=255)
    user = models.IntegerField()
    date_add = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'jet_pinnedapplication'


class LayersAttribute(models.Model):
    attribute = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    attribute_label = models.CharField(max_length=255, blank=True, null=True)
    attribute_type = models.CharField(max_length=50)
    visible = models.BooleanField()
    display_order = models.IntegerField()
    count = models.IntegerField()
    min = models.CharField(max_length=255, blank=True, null=True)
    max = models.CharField(max_length=255, blank=True, null=True)
    average = models.CharField(max_length=255, blank=True, null=True)
    median = models.CharField(max_length=255, blank=True, null=True)
    stddev = models.CharField(max_length=255, blank=True, null=True)
    sum = models.CharField(max_length=255, blank=True, null=True)
    unique_values = models.TextField(blank=True, null=True)
    last_stats_updated = models.DateTimeField()
    layer = models.ForeignKey('LayersLayer', models.DO_NOTHING)
    featureinfo_type = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'layers_attribute'


class LayersLayer(models.Model):
    resourcebase_ptr = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, primary_key=True)
    title_en = models.CharField(max_length=255, blank=True, null=True)
    abstract_en = models.TextField(blank=True, null=True)
    purpose_en = models.TextField(blank=True, null=True)
    constraints_other_en = models.TextField(blank=True, null=True)
    supplemental_information_en = models.TextField(blank=True, null=True)
    data_quality_statement_en = models.TextField(blank=True, null=True)
    workspace = models.CharField(max_length=128)
    store = models.CharField(max_length=128)
    storetype = models.CharField(db_column='storeType', max_length=128)  # Field name made lowercase.
    name = models.CharField(max_length=128)
    typename = models.CharField(max_length=128, blank=True, null=True)
    charset = models.CharField(max_length=255)
    default_style = models.ForeignKey('LayersStyle', models.DO_NOTHING, blank=True, null=True)
    upload_session = models.ForeignKey('LayersUploadsession', models.DO_NOTHING, blank=True, null=True)
    elevation_regex = models.CharField(max_length=128, blank=True, null=True)
    has_elevation = models.BooleanField()
    has_time = models.BooleanField()
    is_mosaic = models.BooleanField()
    time_regex = models.CharField(max_length=128, blank=True, null=True)
    remote_service = models.ForeignKey('ServicesService', models.DO_NOTHING, blank=True, null=True)
    featureinfo_custom_template = models.TextField(blank=True, null=True)
    use_featureinfo_custom_template = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'layers_layer'


class LayersLayerStyles(models.Model):
    layer = models.ForeignKey(LayersLayer, models.DO_NOTHING)
    style = models.ForeignKey('LayersStyle', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'layers_layer_styles'
        unique_together = (('layer', 'style'),)


class LayersLayerfile(models.Model):
    name = models.CharField(max_length=255)
    base = models.BooleanField()
    file = models.CharField(max_length=255)
    upload_session = models.ForeignKey('LayersUploadsession', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'layers_layerfile'


class LayersStyle(models.Model):
    name = models.CharField(unique=True, max_length=255)
    sld_title = models.CharField(max_length=255, blank=True, null=True)
    sld_body = models.TextField(blank=True, null=True)
    sld_version = models.CharField(max_length=12, blank=True, null=True)
    sld_url = models.CharField(max_length=1000, blank=True, null=True)
    workspace = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'layers_style'


class LayersUploadsession(models.Model):
    date = models.DateTimeField()
    processed = models.BooleanField()
    error = models.TextField(blank=True, null=True)
    traceback = models.TextField(blank=True, null=True)
    context = models.TextField(blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)
    resource = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'layers_uploadsession'


class MapsMap(models.Model):
    resourcebase_ptr = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, primary_key=True)
    title_en = models.CharField(max_length=255, blank=True, null=True)
    abstract_en = models.TextField(blank=True, null=True)
    purpose_en = models.TextField(blank=True, null=True)
    constraints_other_en = models.TextField(blank=True, null=True)
    supplemental_information_en = models.TextField(blank=True, null=True)
    data_quality_statement_en = models.TextField(blank=True, null=True)
    zoom = models.IntegerField()
    projection = models.CharField(max_length=32)
    center_x = models.FloatField()
    center_y = models.FloatField()
    last_modified = models.DateTimeField()
    urlsuffix = models.CharField(max_length=255)
    featuredurl = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'maps_map'


class MapsMaplayer(models.Model):
    stack_order = models.IntegerField()
    format = models.TextField(blank=True, null=True)
    name = models.TextField(blank=True, null=True)
    opacity = models.FloatField()
    styles = models.TextField(blank=True, null=True)
    transparent = models.BooleanField()
    fixed = models.BooleanField()
    group = models.TextField(blank=True, null=True)
    visibility = models.BooleanField()
    ows_url = models.CharField(max_length=200, blank=True, null=True)
    layer_params = models.TextField()
    source_params = models.TextField()
    local = models.BooleanField()
    map = models.ForeignKey(MapsMap, models.DO_NOTHING)
    store = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'maps_maplayer'


class Mapstore2AdapterMapstoreattribute(models.Model):
    name = models.CharField(max_length=255)
    label = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=80)
    value = models.TextField()
    resource = models.ForeignKey('Mapstore2AdapterMapstoreresource', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mapstore2_adapter_mapstoreattribute'


class Mapstore2AdapterMapstoredata(models.Model):
    blob = models.TextField()
    resource = models.ForeignKey('Mapstore2AdapterMapstoreresource', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mapstore2_adapter_mapstoredata'


class Mapstore2AdapterMapstoreresource(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    creation_date = models.DateTimeField(blank=True, null=True)
    last_update = models.DateTimeField(blank=True, null=True)
    data = models.ForeignKey(Mapstore2AdapterMapstoredata, models.DO_NOTHING, unique=True, blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mapstore2_adapter_mapstoreresource'


class Mapstore2AdapterMapstoreresourceAttributes(models.Model):
    mapstoreresource = models.ForeignKey(Mapstore2AdapterMapstoreresource, models.DO_NOTHING)
    mapstoreattribute = models.ForeignKey(Mapstore2AdapterMapstoreattribute, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mapstore2_adapter_mapstoreresource_attributes'
        unique_together = (('mapstoreresource', 'mapstoreattribute'),)


class MonitoringEventtype(models.Model):
    name = models.CharField(unique=True, max_length=16)

    class Meta:
        managed = False
        db_table = 'monitoring_eventtype'


class MonitoringExceptionevent(models.Model):
    created = models.DateTimeField()
    received = models.DateTimeField()
    error_type = models.CharField(max_length=255)
    error_data = models.TextField()
    request = models.ForeignKey('MonitoringRequestevent', models.DO_NOTHING)
    service = models.ForeignKey('MonitoringService', models.DO_NOTHING)
    error_message = models.TextField()

    class Meta:
        managed = False
        db_table = 'monitoring_exceptionevent'


class MonitoringHost(models.Model):
    name = models.CharField(max_length=255)
    ip = models.GenericIPAddressField()
    active = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'monitoring_host'


class MonitoringMetric(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    unit = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_metric'


class MonitoringMetriclabel(models.Model):
    name = models.TextField()
    user = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_metriclabel'


class MonitoringMetricnotificationcheck(models.Model):
    min_value = models.DecimalField(max_digits=20, decimal_places=4, blank=True, null=True)
    max_value = models.DecimalField(max_digits=20, decimal_places=4, blank=True, null=True)
    max_timeout = models.DurationField(blank=True, null=True)
    active = models.BooleanField()
    label = models.ForeignKey(MonitoringMetriclabel, models.DO_NOTHING, blank=True, null=True)
    metric = models.ForeignKey(MonitoringMetric, models.DO_NOTHING)
    notification_check = models.ForeignKey('MonitoringNotificationcheck', models.DO_NOTHING)
    resource = models.ForeignKey('MonitoringMonitoredresource', models.DO_NOTHING, blank=True, null=True)
    service = models.ForeignKey('MonitoringService', models.DO_NOTHING, blank=True, null=True)
    definition = models.ForeignKey('MonitoringNotificationmetricdefinition', models.DO_NOTHING, unique=True, blank=True, null=True)
    event_type = models.ForeignKey(MonitoringEventtype, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_metricnotificationcheck'


class MonitoringMetricvalue(models.Model):
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    value = models.CharField(max_length=255)
    value_num = models.DecimalField(max_digits=20, decimal_places=4, blank=True, null=True)
    value_raw = models.TextField(blank=True, null=True)
    data = models.TextField()
    label = models.ForeignKey(MonitoringMetriclabel, models.DO_NOTHING)
    resource = models.ForeignKey('MonitoringMonitoredresource', models.DO_NOTHING, blank=True, null=True)
    service = models.ForeignKey('MonitoringService', models.DO_NOTHING)
    service_metric = models.ForeignKey('MonitoringServicetypemetric', models.DO_NOTHING)
    samples_count = models.IntegerField()
    event_type = models.ForeignKey(MonitoringEventtype, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_metricvalue'
        unique_together = (('valid_from', 'valid_to', 'service', 'service_metric', 'resource', 'label', 'event_type'),)


class MonitoringMonitoredresource(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    resource_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_monitoredresource'
        unique_together = (('name', 'type'),)


class MonitoringNotificationcheck(models.Model):
    name = models.CharField(unique=True, max_length=255)
    description = models.CharField(max_length=255)
    user_threshold = models.TextField()
    grace_period = models.DurationField()
    last_send = models.DateTimeField(blank=True, null=True)
    severity = models.CharField(max_length=32)
    active = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'monitoring_notificationcheck'


class MonitoringNotificationmetricdefinition(models.Model):
    use_service = models.BooleanField()
    use_resource = models.BooleanField()
    use_label = models.BooleanField()
    field_option = models.CharField(max_length=32)
    metric = models.ForeignKey(MonitoringMetric, models.DO_NOTHING)
    notification_check = models.ForeignKey(MonitoringNotificationcheck, models.DO_NOTHING)
    description = models.TextField(blank=True, null=True)
    max_value = models.DecimalField(max_digits=20, decimal_places=4, blank=True, null=True)
    min_value = models.DecimalField(max_digits=20, decimal_places=4, blank=True, null=True)
    steps = models.IntegerField(blank=True, null=True)
    use_event_type = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'monitoring_notificationmetricdefinition'


class MonitoringNotificationreceiver(models.Model):
    email = models.CharField(max_length=254, blank=True, null=True)
    notification_check = models.ForeignKey(MonitoringNotificationcheck, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_notificationreceiver'


class MonitoringRequestevent(models.Model):
    created = models.DateTimeField()
    received = models.DateTimeField()
    host = models.CharField(max_length=255)
    request_path = models.TextField()
    request_method = models.CharField(max_length=16)
    response_status = models.IntegerField()
    response_size = models.IntegerField()
    response_time = models.IntegerField()
    response_type = models.CharField(max_length=255, blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    user_agent_family = models.CharField(max_length=255, blank=True, null=True)
    client_ip = models.GenericIPAddressField(blank=True, null=True)
    client_lat = models.DecimalField(max_digits=11, decimal_places=5, blank=True, null=True)
    client_lon = models.DecimalField(max_digits=11, decimal_places=5, blank=True, null=True)
    client_country = models.CharField(max_length=255, blank=True, null=True)
    client_region = models.CharField(max_length=255, blank=True, null=True)
    client_city = models.CharField(max_length=255, blank=True, null=True)
    custom_id = models.CharField(max_length=255, blank=True, null=True)
    service = models.ForeignKey('MonitoringService', models.DO_NOTHING)
    user_identifier = models.CharField(max_length=255, blank=True, null=True)
    event_type = models.ForeignKey(MonitoringEventtype, models.DO_NOTHING, blank=True, null=True)
    user_username = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'monitoring_requestevent'


class MonitoringRequesteventResources(models.Model):
    requestevent = models.ForeignKey(MonitoringRequestevent, models.DO_NOTHING)
    monitoredresource = models.ForeignKey(MonitoringMonitoredresource, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'monitoring_requestevent_resources'
        unique_together = (('requestevent', 'monitoredresource'),)


class MonitoringService(models.Model):
    name = models.CharField(unique=True, max_length=255)
    check_interval = models.DurationField()
    last_check = models.DateTimeField(blank=True, null=True)
    active = models.BooleanField()
    notes = models.TextField(blank=True, null=True)
    url = models.CharField(max_length=200, blank=True, null=True)
    host = models.ForeignKey(MonitoringHost, models.DO_NOTHING)
    service_type = models.ForeignKey('MonitoringServicetype', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'monitoring_service'


class MonitoringServicetype(models.Model):
    name = models.CharField(unique=True, max_length=255)

    class Meta:
        managed = False
        db_table = 'monitoring_servicetype'


class MonitoringServicetypemetric(models.Model):
    metric = models.ForeignKey(MonitoringMetric, models.DO_NOTHING)
    service_type = models.ForeignKey(MonitoringServicetype, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'monitoring_servicetypemetric'


class Oauth2ProviderAccesstoken(models.Model):
    id = models.BigAutoField(primary_key=True)
    token = models.CharField(unique=True, max_length=255)
    expires = models.DateTimeField()
    scope = models.TextField()
    application = models.ForeignKey('Oauth2ProviderApplication', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    source_refresh_token = models.ForeignKey('Oauth2ProviderRefreshtoken', models.DO_NOTHING, unique=True, blank=True, null=True)
    id_token = models.ForeignKey('Oauth2ProviderIdtoken', models.DO_NOTHING, unique=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oauth2_provider_accesstoken'


class Oauth2ProviderApplication(models.Model):
    id = models.BigAutoField(primary_key=True)
    client_id = models.CharField(unique=True, max_length=100)
    redirect_uris = models.TextField()
    client_type = models.CharField(max_length=32)
    authorization_grant_type = models.CharField(max_length=32)
    client_secret = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)
    skip_authorization = models.BooleanField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    algorithm = models.CharField(max_length=5)

    class Meta:
        managed = False
        db_table = 'oauth2_provider_application'


class Oauth2ProviderGrant(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=255)
    expires = models.DateTimeField()
    redirect_uri = models.CharField(max_length=255)
    scope = models.TextField()
    application = models.ForeignKey(Oauth2ProviderApplication, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    code_challenge = models.CharField(max_length=128)
    code_challenge_method = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'oauth2_provider_grant'


class Oauth2ProviderIdtoken(models.Model):
    id = models.BigAutoField(primary_key=True)
    token = models.TextField(unique=True)
    expires = models.DateTimeField()
    scope = models.TextField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    application = models.ForeignKey(Oauth2ProviderApplication, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oauth2_provider_idtoken'


class Oauth2ProviderRefreshtoken(models.Model):
    id = models.BigAutoField(primary_key=True)
    token = models.CharField(max_length=255)
    access_token = models.ForeignKey(Oauth2ProviderAccesstoken, models.DO_NOTHING, unique=True, blank=True, null=True)
    application = models.ForeignKey(Oauth2ProviderApplication, models.DO_NOTHING)
    user = models.ForeignKey('PeopleProfile', models.DO_NOTHING)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    revoked = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oauth2_provider_refreshtoken'
        unique_together = (('token', 'revoked'),)


class PeopleProfile(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    organization = models.CharField(max_length=255, blank=True, null=True)
    profile = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    area = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=3, blank=True, null=True)
    language = models.CharField(max_length=10)
    timezone = models.CharField(max_length=100)
    agree_conditions = models.BooleanField()
    other_analysis = models.CharField(max_length=50, blank=True, null=True)
    other_role = models.CharField(max_length=50, blank=True, null=True)
    professional_role = models.CharField(max_length=6, blank=True, null=True)
    use_analysis = models.CharField(max_length=8, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'people_profile'


class PeopleProfileGroups(models.Model):
    profile = models.ForeignKey(PeopleProfile, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'people_profile_groups'
        unique_together = (('profile', 'group'),)


class PeopleProfileUserPermissions(models.Model):
    profile = models.ForeignKey(PeopleProfile, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'people_profile_user_permissions'
        unique_together = (('profile', 'permission'),)


class PinaxNotificationsNoticequeuebatch(models.Model):
    pickled_data = models.TextField()

    class Meta:
        managed = False
        db_table = 'pinax_notifications_noticequeuebatch'


class PinaxNotificationsNoticesetting(models.Model):
    medium = models.CharField(max_length=1)
    send = models.BooleanField()
    scoping_object_id = models.IntegerField(blank=True, null=True)
    notice_type = models.ForeignKey('PinaxNotificationsNoticetype', models.DO_NOTHING)
    scoping_content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'pinax_notifications_noticesetting'
        unique_together = (('user', 'notice_type', 'medium', 'scoping_content_type', 'scoping_object_id'),)


class PinaxNotificationsNoticetype(models.Model):
    label = models.CharField(max_length=40)
    display = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    default = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'pinax_notifications_noticetype'


class RatingsOverallrating(models.Model):
    object_id = models.IntegerField()
    rating = models.DecimalField(max_digits=6, decimal_places=1, blank=True, null=True)
    category = models.CharField(max_length=250)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'ratings_overallrating'
        unique_together = (('object_id', 'content_type', 'category'),)


class RatingsRating(models.Model):
    object_id = models.IntegerField()
    rating = models.IntegerField()
    timestamp = models.DateTimeField()
    category = models.CharField(max_length=250)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    overall_rating = models.ForeignKey(RatingsOverallrating, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'ratings_rating'
        unique_together = (('object_id', 'content_type', 'user', 'category'),)


class ServicesHarvestjob(models.Model):
    resource_id = models.CharField(max_length=255)
    status = models.CharField(max_length=15)
    service = models.ForeignKey('ServicesService', models.DO_NOTHING)
    details = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'services_harvestjob'


class ServicesService(models.Model):
    resourcebase_ptr = models.ForeignKey(BaseResourcebase, models.DO_NOTHING, primary_key=True)
    type = models.CharField(max_length=10)
    method = models.CharField(max_length=1)
    base_url = models.CharField(unique=True, max_length=200)
    version = models.CharField(max_length=10, blank=True, null=True)
    name = models.CharField(unique=True, max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)
    online_resource = models.CharField(max_length=200, blank=True, null=True)
    fees = models.CharField(max_length=1000, blank=True, null=True)
    access_constraints = models.CharField(max_length=255, blank=True, null=True)
    connection_params = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    password = models.CharField(max_length=50, blank=True, null=True)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    workspace_ref = models.CharField(max_length=200, blank=True, null=True)
    store_ref = models.CharField(max_length=200, blank=True, null=True)
    resources_ref = models.CharField(max_length=200, blank=True, null=True)
    first_noanswer = models.DateTimeField(blank=True, null=True)
    noanswer_retries = models.IntegerField(blank=True, null=True)
    external_id = models.IntegerField(blank=True, null=True)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    proxy_base = models.CharField(max_length=200, blank=True, null=True)
    probe = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'services_service'


class ServicesServiceprofilerole(models.Model):
    role = models.CharField(max_length=255)
    profiles = models.ForeignKey(PeopleProfile, models.DO_NOTHING)
    service = models.ForeignKey(ServicesService, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'services_serviceprofilerole'


class SocialaccountSocialaccount(models.Model):
    provider = models.CharField(max_length=30)
    uid = models.CharField(max_length=191)
    last_login = models.DateTimeField()
    date_joined = models.DateTimeField()
    extra_data = models.TextField()
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialaccount'
        unique_together = (('provider', 'uid'),)


class SocialaccountSocialapp(models.Model):
    provider = models.CharField(max_length=30)
    name = models.CharField(max_length=40)
    client_id = models.CharField(max_length=191)
    secret = models.CharField(max_length=191)
    key = models.CharField(max_length=191)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialapp'


class SocialaccountSocialappSites(models.Model):
    socialapp = models.ForeignKey(SocialaccountSocialapp, models.DO_NOTHING)
    site = models.ForeignKey(DjangoSite, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialapp_sites'
        unique_together = (('socialapp', 'site'),)


class SocialaccountSocialtoken(models.Model):
    token = models.TextField()
    token_secret = models.TextField()
    expires_at = models.DateTimeField(blank=True, null=True)
    account = models.ForeignKey(SocialaccountSocialaccount, models.DO_NOTHING)
    app = models.ForeignKey(SocialaccountSocialapp, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialtoken'
        unique_together = (('app', 'account'),)


class StudyCasesStudycases(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    treatment_plants = models.CharField(max_length=255)
    water_intakes = models.CharField(max_length=255)
    with_carbon_markets = models.BooleanField()
    erosion_control_drinking_water_qa = models.BooleanField()
    nutrient_retention_ph = models.BooleanField()
    nutrient_retention_ni = models.BooleanField()
    flood_mitigation = models.BooleanField()
    groundwater_recharge_enhancement = models.BooleanField()
    baseflow = models.BooleanField()
    annual_water_yield = models.CharField(max_length=1024)
    sediment_delivery_ratio = models.CharField(max_length=1024)
    nutrient_delivery = models.CharField(max_length=1024)
    seasonal_water_yield = models.CharField(max_length=1024)
    carbon_storage = models.CharField(max_length=1024)
    platform_cost_per_year = models.FloatField()
    personnel_salary_benefits = models.FloatField()
    program_director = models.FloatField()
    monitoring_and_evaluation_mngr = models.FloatField()
    finance_and_admin = models.FloatField()
    implementation_manager = models.FloatField()
    office_costs = models.FloatField()
    travel = models.FloatField()
    equipment = models.FloatField()
    contracts = models.FloatField()
    overhead = models.FloatField()
    others = models.FloatField()
    transaction_costs = models.FloatField()
    discount_rate = models.FloatField()
    sensitive_analysis_min_disc_rate = models.FloatField()
    sensitive_analysis_max_disc_rate = models.FloatField()
    nbs_ca_conservation = models.BooleanField()
    nbs_ca_active_restoration = models.BooleanField()
    nbs_ca_passive_restoration = models.BooleanField()
    nbs_ca_agroforestry = models.BooleanField()
    nbs_ca_silvopastoral = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'study_cases_studycases'


class StudycaseCurrencyCostsCalculatedDani(models.Model):
    type_or_id = models.CharField(max_length=100, blank=True, null=True)
    cost = models.CharField(max_length=100, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=100, blank=True, null=True)
    studycase_id = models.IntegerField(blank=True, null=True)
    date_execution = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'studycase_currency_costs_calculated_dani'


class TaggitTag(models.Model):
    name = models.CharField(unique=True, max_length=100)
    slug = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'taggit_tag'


class TaggitTaggeditem(models.Model):
    object_id = models.IntegerField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    tag = models.ForeignKey(TaggitTag, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'taggit_taggeditem'
        unique_together = (('content_type', 'object_id', 'tag'),)


class TastypieApiaccess(models.Model):
    identifier = models.CharField(max_length=255)
    url = models.TextField()
    request_method = models.CharField(max_length=10)
    accessed = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tastypie_apiaccess'


class TastypieApikey(models.Model):
    key = models.CharField(max_length=128)
    created = models.DateTimeField()
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, unique=True)

    class Meta:
        managed = False
        db_table = 'tastypie_apikey'
# Unable to inspect table 'tbl_basins'
# The error was: user mapping not found for "geonode"



class UploadUpload(models.Model):
    import_id = models.BigIntegerField(blank=True, null=True)
    state = models.CharField(max_length=16)
    date = models.DateTimeField()
    upload_dir = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=64, blank=True, null=True)
    complete = models.BooleanField()
    session = models.TextField(blank=True, null=True)
    metadata = models.TextField(blank=True, null=True)
    mosaic_time_regex = models.CharField(max_length=128, blank=True, null=True)
    mosaic_time_value = models.CharField(max_length=128, blank=True, null=True)
    mosaic_elev_regex = models.CharField(max_length=128, blank=True, null=True)
    mosaic_elev_value = models.CharField(max_length=128, blank=True, null=True)
    layer = models.ForeignKey(LayersLayer, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'upload_upload'


class UploadUploadfile(models.Model):
    file = models.CharField(max_length=100)
    slug = models.CharField(max_length=50)
    upload = models.ForeignKey(UploadUpload, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'upload_uploadfile'


class UserMessagesGroupmemberthread(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    thread = models.ForeignKey('UserMessagesThread', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING)
    deleted = models.BooleanField()
    unread = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'user_messages_groupmemberthread'


class UserMessagesMessage(models.Model):
    sent_at = models.DateTimeField()
    content = models.TextField()
    sender = models.ForeignKey(PeopleProfile, models.DO_NOTHING)
    thread = models.ForeignKey('UserMessagesThread', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'user_messages_message'


class UserMessagesThread(models.Model):
    subject = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'user_messages_thread'


class UserMessagesUserthread(models.Model):
    unread = models.BooleanField()
    deleted = models.BooleanField()
    thread = models.ForeignKey(UserMessagesThread, models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'user_messages_userthread'


class WagtailcoreCollection(models.Model):
    path = models.CharField(unique=True, max_length=255)
    depth = models.IntegerField()
    numchild = models.IntegerField()
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'wagtailcore_collection'


class WagtailcoreCollectionviewrestriction(models.Model):
    restriction_type = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    collection = models.ForeignKey(WagtailcoreCollection, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_collectionviewrestriction'


class WagtailcoreCollectionviewrestrictionGroups(models.Model):
    collectionviewrestriction = models.ForeignKey(WagtailcoreCollectionviewrestriction, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_collectionviewrestriction_groups'
        unique_together = (('collectionviewrestriction', 'group'),)


class WagtailcoreGroupapprovaltask(models.Model):
    task_ptr = models.ForeignKey('WagtailcoreTask', models.DO_NOTHING, primary_key=True)

    class Meta:
        managed = False
        db_table = 'wagtailcore_groupapprovaltask'


class WagtailcoreGroupapprovaltaskGroups(models.Model):
    groupapprovaltask = models.ForeignKey(WagtailcoreGroupapprovaltask, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_groupapprovaltask_groups'
        unique_together = (('groupapprovaltask', 'group'),)


class WagtailcoreGroupcollectionpermission(models.Model):
    collection = models.ForeignKey(WagtailcoreCollection, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_groupcollectionpermission'
        unique_together = (('group', 'collection', 'permission'),)


class WagtailcoreGrouppagepermission(models.Model):
    permission_type = models.CharField(max_length=20)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    page = models.ForeignKey('WagtailcorePage', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_grouppagepermission'
        unique_together = (('group', 'page', 'permission_type'),)


class WagtailcoreLocale(models.Model):
    language_code = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'wagtailcore_locale'


class WagtailcorePage(models.Model):
    path = models.CharField(unique=True, max_length=255)
    depth = models.IntegerField()
    numchild = models.IntegerField()
    title = models.CharField(max_length=255)
    slug = models.CharField(max_length=255)
    live = models.BooleanField()
    has_unpublished_changes = models.BooleanField()
    url_path = models.TextField()
    seo_title = models.CharField(max_length=255)
    show_in_menus = models.BooleanField()
    search_description = models.TextField()
    go_live_at = models.DateTimeField(blank=True, null=True)
    expire_at = models.DateTimeField(blank=True, null=True)
    expired = models.BooleanField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    owner = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    locked = models.BooleanField()
    latest_revision_created_at = models.DateTimeField(blank=True, null=True)
    first_published_at = models.DateTimeField(blank=True, null=True)
    live_revision = models.ForeignKey('WagtailcorePagerevision', models.DO_NOTHING, blank=True, null=True)
    last_published_at = models.DateTimeField(blank=True, null=True)
    draft_title = models.CharField(max_length=255)
    locked_at = models.DateTimeField(blank=True, null=True)
    locked_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    translation_key = models.UUIDField()
    locale = models.ForeignKey(WagtailcoreLocale, models.DO_NOTHING)
    alias_of = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wagtailcore_page'
        unique_together = (('translation_key', 'locale'),)


class WagtailcorePagelogentry(models.Model):
    label = models.TextField()
    action = models.CharField(max_length=255)
    data_json = models.TextField()
    timestamp = models.DateTimeField()
    content_changed = models.BooleanField()
    deleted = models.BooleanField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING, blank=True, null=True)
    page_id = models.IntegerField()
    revision_id = models.IntegerField(blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wagtailcore_pagelogentry'


class WagtailcorePagerevision(models.Model):
    submitted_for_moderation = models.BooleanField()
    created_at = models.DateTimeField()
    content_json = models.TextField()
    approved_go_live_at = models.DateTimeField(blank=True, null=True)
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wagtailcore_pagerevision'


class WagtailcorePageviewrestriction(models.Model):
    password = models.CharField(max_length=255)
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING)
    restriction_type = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'wagtailcore_pageviewrestriction'


class WagtailcorePageviewrestrictionGroups(models.Model):
    pageviewrestriction = models.ForeignKey(WagtailcorePageviewrestriction, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_pageviewrestriction_groups'
        unique_together = (('pageviewrestriction', 'group'),)


class WagtailcoreSite(models.Model):
    hostname = models.CharField(max_length=255)
    port = models.IntegerField()
    is_default_site = models.BooleanField()
    root_page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING)
    site_name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'wagtailcore_site'
        unique_together = (('hostname', 'port'),)


class WagtailcoreTask(models.Model):
    name = models.CharField(max_length=255)
    active = models.BooleanField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_task'


class WagtailcoreTaskstate(models.Model):
    status = models.CharField(max_length=50)
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(blank=True, null=True)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)
    page_revision = models.ForeignKey(WagtailcorePagerevision, models.DO_NOTHING)
    task = models.ForeignKey(WagtailcoreTask, models.DO_NOTHING)
    workflow_state = models.ForeignKey('WagtailcoreWorkflowstate', models.DO_NOTHING)
    finished_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    comment = models.TextField()

    class Meta:
        managed = False
        db_table = 'wagtailcore_taskstate'


class WagtailcoreWorkflow(models.Model):
    name = models.CharField(max_length=255)
    active = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'wagtailcore_workflow'


class WagtailcoreWorkflowpage(models.Model):
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING, primary_key=True)
    workflow = models.ForeignKey(WagtailcoreWorkflow, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_workflowpage'


class WagtailcoreWorkflowstate(models.Model):
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    current_task_state = models.ForeignKey(WagtailcoreTaskstate, models.DO_NOTHING, unique=True, blank=True, null=True)
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING, unique=True)
    requested_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    workflow = models.ForeignKey(WagtailcoreWorkflow, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_workflowstate'


class WagtailcoreWorkflowtask(models.Model):
    sort_order = models.IntegerField(blank=True, null=True)
    task = models.ForeignKey(WagtailcoreTask, models.DO_NOTHING)
    workflow = models.ForeignKey(WagtailcoreWorkflow, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailcore_workflowtask'
        unique_together = (('workflow', 'task'),)


class WagtaildocsDocument(models.Model):
    title = models.CharField(max_length=255)
    file = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    uploaded_by_user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    collection = models.ForeignKey(WagtailcoreCollection, models.DO_NOTHING)
    file_size = models.IntegerField(blank=True, null=True)
    file_hash = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'wagtaildocs_document'


class WagtailembedsEmbed(models.Model):
    url = models.CharField(max_length=200)
    max_width = models.SmallIntegerField(blank=True, null=True)
    type = models.CharField(max_length=10)
    html = models.TextField()
    title = models.TextField()
    author_name = models.TextField()
    provider_name = models.TextField()
    thumbnail_url = models.CharField(max_length=255, blank=True, null=True)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    last_updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wagtailembeds_embed'
        unique_together = (('url', 'max_width'),)


class WagtailformsFormsubmission(models.Model):
    form_data = models.TextField()
    submit_time = models.DateTimeField()
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailforms_formsubmission'


class WagtailimagesImage(models.Model):
    title = models.CharField(max_length=255)
    file = models.CharField(max_length=100)
    width = models.IntegerField()
    height = models.IntegerField()
    created_at = models.DateTimeField()
    focal_point_x = models.IntegerField(blank=True, null=True)
    focal_point_y = models.IntegerField(blank=True, null=True)
    focal_point_width = models.IntegerField(blank=True, null=True)
    focal_point_height = models.IntegerField(blank=True, null=True)
    uploaded_by_user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    collection = models.ForeignKey(WagtailcoreCollection, models.DO_NOTHING)
    file_hash = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'wagtailimages_image'


class WagtailimagesRendition(models.Model):
    file = models.CharField(max_length=100)
    width = models.IntegerField()
    height = models.IntegerField()
    focal_point_key = models.CharField(max_length=16)
    filter_spec = models.CharField(max_length=255)
    image = models.ForeignKey(WagtailimagesImage, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailimages_rendition'
        unique_together = (('image', 'filter_spec', 'focal_point_key'),)


class WagtailimagesUploadedimage(models.Model):
    file = models.CharField(max_length=200)
    uploaded_by_user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wagtailimages_uploadedimage'


class WagtailredirectsRedirect(models.Model):
    old_path = models.CharField(max_length=255)
    is_permanent = models.BooleanField()
    redirect_link = models.CharField(max_length=255)
    redirect_page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING, blank=True, null=True)
    site = models.ForeignKey(WagtailcoreSite, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wagtailredirects_redirect'
        unique_together = (('old_path', 'site'),)


class WagtailsearchEditorspick(models.Model):
    sort_order = models.IntegerField(blank=True, null=True)
    description = models.TextField()
    page = models.ForeignKey(WagtailcorePage, models.DO_NOTHING)
    query = models.ForeignKey('WagtailsearchQuery', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailsearch_editorspick'


class WagtailsearchQuery(models.Model):
    query_string = models.CharField(unique=True, max_length=255)

    class Meta:
        managed = False
        db_table = 'wagtailsearch_query'


class WagtailsearchQuerydailyhits(models.Model):
    date = models.DateField()
    hits = models.IntegerField()
    query = models.ForeignKey(WagtailsearchQuery, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wagtailsearch_querydailyhits'
        unique_together = (('query', 'date'),)


class WagtailusersUserprofile(models.Model):
    submitted_notifications = models.BooleanField()
    approved_notifications = models.BooleanField()
    rejected_notifications = models.BooleanField()
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, unique=True)
    preferred_language = models.CharField(max_length=10)
    current_time_zone = models.CharField(max_length=40)
    avatar = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'wagtailusers_userprofile'


class WaterproofBdgCostFuntionsProcess(models.Model):
    id_categorias = models.IntegerField(db_column='ID_Categorias', blank=True, null=True)  # Field name made lowercase.
    simbolo = models.CharField(db_column='Simbolo', max_length=3, blank=True, null=True)  # Field name made lowercase.
    categorias = models.CharField(db_column='Categorias', max_length=50, blank=True, null=True)  # Field name made lowercase.
    energia = models.IntegerField(db_column='Energia', blank=True, null=True)  # Field name made lowercase.
    mano_de_obra = models.IntegerField(db_column='Mano_de_Obra', blank=True, null=True)  # Field name made lowercase.
    materiales_y_equipos = models.IntegerField(db_column='Materiales_y_Equipos', blank=True, null=True)  # Field name made lowercase.
    funciones = models.CharField(db_column='Funciones', max_length=659, blank=True, null=True)  # Field name made lowercase.
    nombre_funcion = models.CharField(db_column='Nombre_Funcion', max_length=-1, blank=True, null=True)  # Field name made lowercase.
    descripcion_funcion = models.CharField(db_column='Descripcion_Funcion', max_length=-1, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'waterproof_bdg_cost_funtions_process'


class WaterproofBdgCountries(models.Model):
    id = models.IntegerField(db_column='ID', primary_key=True)  # Field name made lowercase.
    paises = models.CharField(db_column='Paises', max_length=100, blank=True, null=True)  # Field name made lowercase.
    region_id = models.IntegerField(blank=True, null=True)
    nombre_region = models.CharField(max_length=100, blank=True, null=True)
    codigo_estandar_de_agua_potable = models.IntegerField(db_column='Codigo_estandar_de_agua_potable', blank=True, null=True)  # Field name made lowercase.
    factor_multiplicador_energia_field = models.FloatField(db_column='Factor_multiplicador__energia_', blank=True, null=True)  # Field name made lowercase. Field renamed because it contained more than one '_' in a row. Field renamed because it ended with '_'.
    factor_multiplicador_materiales_field = models.FloatField(db_column='Factor_multiplicador__materiales_', blank=True, null=True)  # Field name made lowercase. Field renamed because it contained more than one '_' in a row. Field renamed because it ended with '_'.
    factor_multiplicador_mano_de_obra_field = models.FloatField(db_column='Factor_multiplicador__mano_de_obra_', blank=True, null=True)  # Field name made lowercase. Field renamed because it contained more than one '_' in a row. Field renamed because it ended with '_'.
    factor_multiplicador_global_field = models.FloatField(db_column='Factor_multiplicador__global_', blank=True, null=True)  # Field name made lowercase. Field renamed because it contained more than one '_' in a row. Field renamed because it ended with '_'.

    class Meta:
        managed = False
        db_table = 'waterproof_bdg_countries'


class WaterproofBdgProcess(models.Model):
    tes_system_id = models.IntegerField(blank=True, null=True)
    tes_name_element = models.CharField(max_length=30, blank=True, null=True)
    elm_proceso_id = models.IntegerField(blank=True, null=True)
    elm_proceso_unitario = models.CharField(max_length=34, blank=True, null=True)
    ctl_categoria_id = models.IntegerField(blank=True, null=True)
    ctl_simbolo = models.CharField(max_length=3, blank=True, null=True)
    ctl_categoria_nombre = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_bdg_process'


class WaterproofBdgProcessesEfficiencies(models.Model):
    sistema = models.CharField(max_length=9, blank=True, null=True)
    id_proceso = models.CharField(max_length=3, blank=True, null=True)
    proceso_unitario = models.CharField(max_length=34, blank=True, null=True)
    id_categorias = models.IntegerField(blank=True, null=True)
    simbolo = models.CharField(max_length=3, blank=True, null=True)
    categorias = models.CharField(max_length=42, blank=True, null=True)
    porcen_sedimentos_minimo = models.IntegerField(blank=True, null=True)
    porcen_sedimentos_predefinido = models.CharField(max_length=4, blank=True, null=True)
    porcen_sedimentos_maximo = models.IntegerField(blank=True, null=True)
    porcen_nitrogeno_minimo = models.CharField(max_length=3, blank=True, null=True)
    porcen_nitrogeno_predefinido = models.CharField(max_length=19, blank=True, null=True)
    porcen_nitrogeno_maximo = models.IntegerField(blank=True, null=True)
    porcen_fosforo_minimo = models.CharField(max_length=3, blank=True, null=True)
    porcen_fosforo_predefinido = models.CharField(max_length=18, blank=True, null=True)
    porcen_fosforo_maximo = models.IntegerField(blank=True, null=True)
    categorianormalizada = models.CharField(db_column='CategoriaNormalizada', max_length=-1)  # Field name made lowercase.
    porcen_agua_transportado_predefinido = models.CharField(db_column='Porcen_agua_transportado_predefinido', max_length=4, blank=True, null=True)  # Field name made lowercase.
    porcen_agua_transportado_minimo = models.CharField(max_length=4, blank=True, null=True)
    porcen_agua_transportado_maximo = models.CharField(max_length=4, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_bdg_processes_efficiencies'


class WaterproofCmsHomepage(models.Model):
    page_ptr = models.ForeignKey(WagtailcorePage, models.DO_NOTHING, primary_key=True)
    body = models.TextField()

    class Meta:
        managed = False
        db_table = 'waterproof_cms_homepage'


class WaterproofIntakeBasins(models.Model):
    id = models.DecimalField(primary_key=True, max_digits=65535, decimal_places=65535)
    geom = models.MultiPolygonField(blank=True, null=True)
    continent = models.CharField(max_length=254, blank=True, null=True)
    symbol = models.CharField(max_length=254, blank=True, null=True)
    code = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    label = models.CharField(max_length=50, blank=True, null=True)
    x_min = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    x_max = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    y_min = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    y_max = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_basins'


class WaterproofIntakeCity(models.Model):
    name = models.CharField(max_length=100)
    country_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_city'


class WaterproofIntakeCostfunctionsprocess(models.Model):
    id = models.ForeignKey('WaterproofIntakeProcessefficiencies', models.DO_NOTHING, db_column='id', primary_key=True)
    symbol = models.CharField(max_length=5)
    categorys = models.CharField(max_length=100)
    energy = models.DecimalField(max_digits=14, decimal_places=4)
    labour = models.DecimalField(max_digits=14, decimal_places=4)
    mater_equipment = models.DecimalField(max_digits=14, decimal_places=4)
    function_value = models.CharField(max_length=1000)
    function_name = models.CharField(max_length=250)
    function_description = models.CharField(max_length=250, blank=True, null=True)
    default_function = models.BooleanField(blank=True, null=True)
    process_efficiencies_id = models.IntegerField(blank=True, null=True)
    sub_process = models.CharField(max_length=100, blank=True, null=True)
    mayor_menor = models.BooleanField(blank=True, null=True)
    caudal = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    currency = models.CharField(max_length=255, blank=True, null=True)
    function_py_value_field = models.CharField(db_column='function_py_value_', max_length=2500, blank=True, null=True)  # Field renamed because it ended with '_'.
    function_py_value_field_0 = models.CharField(db_column='function_py_value__', max_length=2500, blank=True, null=True)  # Field renamed because it contained more than one '_' in a row. Field renamed because it ended with '_'. Field renamed because of name conflict.
    function_py_value = models.CharField(max_length=2500, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_costfunctionsprocess'


class WaterproofIntakeDemandparameters(models.Model):
    interpolation_type = models.CharField(max_length=30)
    initial_extraction = models.DecimalField(max_digits=14, decimal_places=4)
    ending_extraction = models.DecimalField(max_digits=14, decimal_places=4)
    is_manual = models.BooleanField()
    years_number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_demandparameters'


class WaterproofIntakeElementconnections(models.Model):
    source = models.ForeignKey('WaterproofIntakeElementsystem', models.DO_NOTHING)
    target = models.ForeignKey('WaterproofIntakeElementsystem', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_elementconnections'


class WaterproofIntakeElementsystem(models.Model):
    name = models.CharField(max_length=100)
    nitrogen = models.DecimalField(max_digits=14, decimal_places=2)
    normalized_category = models.CharField(max_length=100)
    phosphorus = models.DecimalField(max_digits=14, decimal_places=2)
    sediment = models.DecimalField(max_digits=14, decimal_places=2)
    intake = models.ForeignKey('WaterproofIntakeIntake', models.DO_NOTHING)
    q_l_s = models.FloatField(blank=True, null=True)
    awy = models.FloatField(blank=True, null=True)
    cn_mg_l = models.FloatField(blank=True, null=True)
    cp_mg_l = models.FloatField(blank=True, null=True)
    csed_mg_l = models.FloatField(blank=True, null=True)
    wn_kg = models.FloatField(blank=True, null=True)
    wn_ret_kg = models.FloatField(blank=True, null=True)
    wp_ret_ton = models.FloatField(blank=True, null=True)
    wsed_ret_ton = models.FloatField(blank=True, null=True)
    wsed_ton = models.FloatField(blank=True, null=True)
    wp_kg = models.FloatField(blank=True, null=True)
    graphid = models.IntegerField(db_column='graphId')  # Field name made lowercase.
    transported_water = models.DecimalField(max_digits=14, decimal_places=2)
    is_external = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_elementsystem'


class WaterproofIntakeIntake(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    added_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    city = models.ForeignKey('WaterproofParametersCities', models.DO_NOTHING)
    creation_date = models.DateField()
    demand_parameters = models.ForeignKey(WaterproofIntakeDemandparameters, models.DO_NOTHING, blank=True, null=True)
    updated_date = models.DateField()
    water_source_name = models.CharField(max_length=100)
    xml_graph = models.TextField(blank=True, null=True)
    area = models.GeometryField(srid=0, blank=True, null=True)
    is_complete = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_intake'


class WaterproofIntakePolygon(models.Model):
    area = models.FloatField(blank=True, null=True)
    geom = models.PolygonField(blank=True, null=True)
    delimitation_date = models.DateField()
    delimitation_type = models.CharField(max_length=30, blank=True, null=True)
    basin_id = models.IntegerField()
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING)
    geomintake = models.TextField(db_column='geomIntake', blank=True, null=True)  # Field name made lowercase.
    geompoint = models.TextField(db_column='geomPoint', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'waterproof_intake_polygon'


class WaterproofIntakeProcessefficiencies(models.Model):
    name = models.CharField(max_length=100)
    unitary_process = models.CharField(max_length=100)
    symbol = models.CharField(max_length=100)
    categorys = models.CharField(max_length=100)
    normalized_category = models.CharField(max_length=100)
    minimal_sediment_perc = models.FloatField()
    predefined_sediment_perc = models.FloatField()
    maximal_sediment_perc = models.FloatField()
    minimal_nitrogen_perc = models.FloatField()
    predefined_nitrogen_perc = models.FloatField()
    maximal_nitrogen_perc = models.FloatField()
    minimal_phoshorus_perc = models.FloatField()
    predefined_phosphorus_perc = models.FloatField()
    maximal_phosphorus_perc = models.FloatField()
    minimal_transp_water_perc = models.DecimalField(max_digits=14, decimal_places=2)
    predefined_transp_water_perc = models.DecimalField(max_digits=14, decimal_places=2)
    maximal_transp_water_perc = models.DecimalField(max_digits=14, decimal_places=2)
    id_wb = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_processefficiencies'


class WaterproofIntakeSystemcosts(models.Model):
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=14, decimal_places=4)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_systemcosts'


class WaterproofIntakeUsercostfunctions(models.Model):
    function = models.CharField(max_length=2500, blank=True, null=True)
    template_function = models.ForeignKey(WaterproofIntakeCostfunctionsprocess, models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    name = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    currency_id = models.IntegerField(blank=True, null=True)
    function_py_value = models.CharField(max_length=2500, blank=True, null=True)
    function_graph = models.CharField(max_length=-1, blank=True, null=True)
    element_system_id_field = models.IntegerField(db_column='element_system_id_', blank=True, null=True)  # Field renamed because it ended with '_'.
    intake_id_field = models.IntegerField(db_column='intake_id_', blank=True, null=True)  # Field renamed because it ended with '_'.
    element_system = models.ForeignKey(WaterproofIntakeElementsystem, models.DO_NOTHING, blank=True, null=True)
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_usercostfunctions'


class WaterproofIntakeUsercosts(models.Model):
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=14, decimal_places=4)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_usercosts'


class WaterproofIntakeUserlogicalfunctions(models.Model):
    function1 = models.TextField()
    condition1 = models.TextField()
    function2 = models.TextField()
    condition2 = models.TextField()
    function3 = models.TextField()
    condition3 = models.TextField()
    mainfunction = models.ForeignKey(WaterproofIntakeUsercostfunctions, models.DO_NOTHING, db_column='mainFunction_id')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'waterproof_intake_userlogicalfunctions'


class WaterproofIntakeValuestime(models.Model):
    year = models.IntegerField()
    water_volume = models.DecimalField(max_digits=14, decimal_places=2)
    sediment = models.DecimalField(max_digits=14, decimal_places=2)
    nitrogen = models.DecimalField(max_digits=14, decimal_places=2)
    phosphorus = models.DecimalField(max_digits=14, decimal_places=2)
    element_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'waterproof_intake_valuestime'


class WaterproofIntakeWaterextraction(models.Model):
    year = models.IntegerField()
    value = models.DecimalField(max_digits=14, decimal_places=4)
    demand = models.ForeignKey(WaterproofIntakeDemandparameters, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_intake_waterextraction'


class WaterproofNbsCaActivityshapefile(models.Model):
    activity = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    area = models.MultiPolygonField()

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_activityshapefile'


class WaterproofNbsCaRiosactivity(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    transition = models.ForeignKey('WaterproofNbsCaRiostransition', models.DO_NOTHING)
    lucode = models.ForeignKey('WaterproofPrLulc', models.DO_NOTHING, db_column='lucode', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_riosactivity'


class WaterproofNbsCaRiostransformation(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    activity = models.ForeignKey(WaterproofNbsCaRiosactivity, models.DO_NOTHING)
    unique_id = models.CharField(max_length=1024)
    lucode = models.ForeignKey('WaterproofPrLulc', models.DO_NOTHING, db_column='lucode', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_riostransformation'


class WaterproofNbsCaRiostransition(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    file_name = models.CharField(max_length=100, blank=True, null=True)
    transition_type = models.CharField(max_length=50, blank=True, null=True)
    id_transition = models.CharField(max_length=10, blank=True, null=True)
    label = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_riostransition'


class WaterproofNbsCaWaterproofnbsca(models.Model):
    name = models.CharField(unique=True, max_length=100)
    description = models.CharField(max_length=2048)
    max_benefit_req_time = models.FloatField()
    periodicity_maitenance = models.IntegerField()
    profit_pct_time_inter_assoc = models.DecimalField(max_digits=10, decimal_places=2)
    unit_implementation_cost = models.DecimalField(max_digits=14, decimal_places=2)
    unit_maintenance_cost = models.DecimalField(max_digits=14, decimal_places=2)
    unit_oportunity_cost = models.DecimalField(max_digits=14, decimal_places=2)
    added_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    country = models.ForeignKey('WaterproofParametersCountries', models.DO_NOTHING)
    currency = models.ForeignKey('WaterproofParametersCountries', models.DO_NOTHING)
    activity_shapefile = models.ForeignKey(WaterproofNbsCaActivityshapefile, models.DO_NOTHING, blank=True, null=True)
    slug = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_waterproofnbsca'


class WaterproofNbsCaWaterproofnbscaRiosTransformations(models.Model):
    waterproofnbsca = models.ForeignKey(WaterproofNbsCaWaterproofnbsca, models.DO_NOTHING)
    riostransformation = models.ForeignKey(WaterproofNbsCaRiostransformation, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_nbs_ca_waterproofnbsca_rios_transformations'
        unique_together = (('waterproofnbsca', 'riostransformation'),)


class WaterproofParametersBiophysical(models.Model):
    lucode = models.IntegerField(blank=True, null=True)
    lulc_desc = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    kc = models.FloatField(blank=True, null=True)
    root_depth = models.FloatField(blank=True, null=True)
    usle_c = models.FloatField(blank=True, null=True)
    usle_p = models.FloatField(blank=True, null=True)
    load_n = models.FloatField(blank=True, null=True)
    eff_n = models.FloatField(blank=True, null=True)
    load_p = models.FloatField(blank=True, null=True)
    eff_p = models.FloatField(blank=True, null=True)
    crit_len_n = models.IntegerField(blank=True, null=True)
    crit_len_p = models.IntegerField(blank=True, null=True)
    proportion_subsurface_n = models.FloatField(blank=True, null=True)
    cn_a = models.FloatField(blank=True, null=True)
    cn_b = models.FloatField(blank=True, null=True)
    cn_c = models.FloatField(blank=True, null=True)
    cn_d = models.FloatField(blank=True, null=True)
    kc_1 = models.FloatField(blank=True, null=True)
    kc_2 = models.FloatField(blank=True, null=True)
    kc_3 = models.FloatField(blank=True, null=True)
    kc_4 = models.FloatField(blank=True, null=True)
    kc_5 = models.FloatField(blank=True, null=True)
    kc_6 = models.FloatField(blank=True, null=True)
    kc_7 = models.FloatField(blank=True, null=True)
    kc_8 = models.FloatField(blank=True, null=True)
    kc_9 = models.FloatField(blank=True, null=True)
    kc_10 = models.FloatField(blank=True, null=True)
    kc_11 = models.FloatField(blank=True, null=True)
    kc_12 = models.FloatField(blank=True, null=True)
    c_above = models.FloatField(blank=True, null=True)
    c_below = models.FloatField(blank=True, null=True)
    c_soil = models.FloatField(blank=True, null=True)
    c_dead = models.FloatField(blank=True, null=True)
    sed_exp = models.FloatField(blank=True, null=True)
    sed_ret = models.FloatField(blank=True, null=True)
    rough_rank = models.FloatField(blank=True, null=True)
    cover_rank = models.FloatField(blank=True, null=True)
    p_ret = models.FloatField(blank=True, null=True)
    p_exp = models.FloatField(blank=True, null=True)
    n_ret = models.FloatField(blank=True, null=True)
    n_exp = models.FloatField(blank=True, null=True)
    native_veg = models.IntegerField(blank=True, null=True)
    lulc_veg = models.IntegerField(blank=True, null=True)
    macro_region = models.TextField(blank=True, null=True)
    default = models.TextField(blank=True, null=True)
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING, blank=True, null=True)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_biophysical'


class WaterproofParametersBiophysicalBackup(models.Model):
    lucode = models.IntegerField(blank=True, null=True)
    lulc_desc = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    kc = models.FloatField(blank=True, null=True)
    root_depth = models.FloatField(blank=True, null=True)
    usle_c = models.FloatField(blank=True, null=True)
    usle_p = models.FloatField(blank=True, null=True)
    load_n = models.FloatField(blank=True, null=True)
    eff_n = models.FloatField(blank=True, null=True)
    load_p = models.FloatField(blank=True, null=True)
    eff_p = models.FloatField(blank=True, null=True)
    crit_len_n = models.IntegerField(blank=True, null=True)
    crit_len_p = models.IntegerField(blank=True, null=True)
    proportion_subsurface_n = models.FloatField(blank=True, null=True)
    cn_a = models.FloatField(blank=True, null=True)
    cn_b = models.FloatField(blank=True, null=True)
    cn_c = models.FloatField(blank=True, null=True)
    cn_d = models.FloatField(blank=True, null=True)
    kc_1 = models.FloatField(blank=True, null=True)
    kc_2 = models.FloatField(blank=True, null=True)
    kc_3 = models.FloatField(blank=True, null=True)
    kc_4 = models.FloatField(blank=True, null=True)
    kc_5 = models.FloatField(blank=True, null=True)
    kc_6 = models.FloatField(blank=True, null=True)
    kc_7 = models.FloatField(blank=True, null=True)
    kc_8 = models.FloatField(blank=True, null=True)
    kc_9 = models.FloatField(blank=True, null=True)
    kc_10 = models.FloatField(blank=True, null=True)
    kc_11 = models.FloatField(blank=True, null=True)
    kc_12 = models.FloatField(blank=True, null=True)
    c_above = models.FloatField(blank=True, null=True)
    c_below = models.FloatField(blank=True, null=True)
    c_soil = models.FloatField(blank=True, null=True)
    c_dead = models.FloatField(blank=True, null=True)
    sed_exp = models.FloatField(blank=True, null=True)
    sed_ret = models.FloatField(blank=True, null=True)
    rough_rank = models.FloatField(blank=True, null=True)
    cover_rank = models.FloatField(blank=True, null=True)
    p_ret = models.FloatField(blank=True, null=True)
    p_exp = models.FloatField(blank=True, null=True)
    n_ret = models.FloatField(blank=True, null=True)
    n_exp = models.FloatField(blank=True, null=True)
    native_veg = models.IntegerField(blank=True, null=True)
    lulc_veg = models.IntegerField(blank=True, null=True)
    macro_region = models.TextField(blank=True, null=True)
    default = models.TextField(blank=True, null=True)
    id = models.IntegerField(blank=True, null=True)
    intake_id = models.IntegerField(blank=True, null=True)
    study_case_id = models.IntegerField(blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_biophysical_backup'


class WaterproofParametersCities(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    state_id = models.IntegerField()
    state_code = models.CharField(max_length=255)
    country_id = models.IntegerField()
    country_code = models.CharField(max_length=2)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    created_at = models.DateTimeField()
    updated_on = models.DateTimeField()
    flag = models.BooleanField()
    wikidataid = models.CharField(db_column='wikiDataId', max_length=255, blank=True, null=True)  # Field name made lowercase.
    standard_name_spanish = models.CharField(max_length=255)
    standard_name_english = models.CharField(max_length=255)
    geom = models.PointField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_cities'


class WaterproofParametersClimateValue(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_climate_value'


class WaterproofParametersCountries(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    iso3 = models.CharField(max_length=3, blank=True, null=True)
    iso2 = models.CharField(max_length=2, blank=True, null=True)
    phonecode = models.CharField(max_length=255, blank=True, null=True)
    capital = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=255)
    currency_symbol = models.CharField(max_length=255)
    native = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    subregion = models.CharField(max_length=255, blank=True, null=True)
    timezones = models.TextField(blank=True, null=True)
    translations = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    emoji = models.CharField(max_length=191, blank=True, null=True)
    emojiu = models.CharField(db_column='emojiU', max_length=191, blank=True, null=True)  # Field name made lowercase.
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    flag = models.BooleanField()
    wikidataid = models.CharField(db_column='wikiDataId', max_length=255, blank=True, null=True)  # Field name made lowercase.
    global_multiplier_factor = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    description_standard_spanish = models.CharField(max_length=255, blank=True, null=True)
    description_standard_english = models.CharField(max_length=255, blank=True, null=True)
    standard_region_tnc = models.CharField(max_length=100, blank=True, null=True)
    region_0 = models.ForeignKey('WaterproofParametersRegions', models.DO_NOTHING, db_column='region_id', blank=True, null=True)  # Field renamed because of name conflict.

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_countries'


class WaterproofParametersCountriesFactor(models.Model):
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    currency = models.CharField(max_length=4)
    factor_eur = models.DecimalField(db_column='factor_EUR', max_digits=21, decimal_places=6, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_countries_factor'


class WaterproofParametersManagmentcostsDiscount(models.Model):
    program_director_usd_year = models.DecimalField(db_column='Program_Director_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    implementation_manager_usd_year = models.DecimalField(db_column='Implementation_Manager_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    monitoring_and_evaluation_manager_usd_year = models.DecimalField(db_column='Monitoring_and_Evaluation_Manager_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    finance_manager_usd_year = models.DecimalField(db_column='Finance_Manager_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    administrative_assistant_usd_year = models.DecimalField(db_column='Administrative_Assistant_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    office_costs_usd_year = models.DecimalField(db_column='Office_Costs_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    overhead_usd_year = models.DecimalField(db_column='Overhead_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    equipment_purchased_in_year_1_usd = models.DecimalField(db_column='Equipment_Purchased_In_Year_1_USD', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    vehicles_purchased_in_year_1_usd = models.DecimalField(db_column='Vehicles_Purchased_In_Year_1_USD', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    equipment_maintenance_usd_year = models.DecimalField(db_column='Equipment_Maintenance_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    vehicle_maintenance_usd_year = models.DecimalField(db_column='Vehicle_Maintenance_USD_YEAR', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    drt_discount_rate_medium = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    drt_discount_rate_upper_limit = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    drt_discount_rate_lower_limit = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    transaction_cost = models.DecimalField(db_column='Transaction_cost', max_digits=3, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    country = models.ForeignKey(WaterproofParametersCountries, models.DO_NOTHING)
    drinking_water_standard_code = models.IntegerField(blank=True, null=True)
    energy_multiplier_factor = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    market_carbon_precing_usd_tonco2e = models.DecimalField(db_column='market_carbon_precing_USD_TonCO2e', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    material_multiplier_factor = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    work_hand_multiplier_factor = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_managmentcosts_discount'


class WaterproofParametersObjetivesPriorities(models.Model):
    model = models.ForeignKey('WaterproofPrObjectives', models.DO_NOTHING, db_column='model', blank=True, null=True)
    transition = models.ForeignKey(WaterproofNbsCaRiostransition, models.DO_NOTHING, db_column='transition', blank=True, null=True)
    parameter = models.ForeignKey('WaterproofPrParametro', models.DO_NOTHING, db_column='parameter', blank=True, null=True)
    value = models.CharField(max_length=5, blank=True, null=True)
    default = models.CharField(max_length=15, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING, blank=True, null=True)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING, blank=True, null=True)
    id = models.AutoField()

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_objetives_priorities'


class WaterproofParametersRegions(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=70, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_regions'


class WaterproofParametersTransitionsPriorities(models.Model):
    id = models.AutoField()
    model = models.ForeignKey('WaterproofPrObjectives', models.DO_NOTHING, db_column='model', blank=True, null=True)
    transition = models.ForeignKey(WaterproofNbsCaRiostransition, models.DO_NOTHING, db_column='transition', blank=True, null=True)
    value = models.CharField(max_length=-1, blank=True, null=True)
    default = models.CharField(max_length=-1, blank=True, null=True)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING, blank=True, null=True)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_parameters_transitions_priorities'


class WaterproofPrConstants(models.Model):
    id_constant = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    value = models.CharField(max_length=100, blank=True, null=True)
    id_basin = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_pr_constants'


class WaterproofPrLulc(models.Model):
    lucode = models.IntegerField(primary_key=True)
    lulc_desc = models.CharField(db_column='LULC_desc', max_length=255, blank=True, null=True)  # Field name made lowercase.
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_pr_lulc'


class WaterproofPrModels(models.Model):
    id_modelo = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    alias = models.CharField(max_length=255, blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    out_folder = models.CharField(max_length=255, blank=True, null=True)
    out_folder_quality = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_pr_models'


class WaterproofPrObjectives(models.Model):
    id_objective = models.AutoField(primary_key=True)
    objective_name = models.CharField(max_length=100, blank=True, null=True)
    objective_name_sp = models.CharField(max_length=100, blank=True, null=True)
    objective_alias = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_pr_objectives'


class WaterproofPrParameterModel(models.Model):
    id_parameter = models.ForeignKey('WaterproofPrParametro', models.DO_NOTHING, db_column='id_parameter', primary_key=True)
    id_model = models.ForeignKey(WaterproofPrModels, models.DO_NOTHING, db_column='id_model')

    class Meta:
        managed = False
        db_table = 'waterproof_pr_parameter_model'
        unique_together = (('id_parameter', 'id_model'),)


class WaterproofPrParameterObjective(models.Model):
    id_parameter = models.ForeignKey('WaterproofPrParametro', models.DO_NOTHING, db_column='id_parameter', primary_key=True)
    id_objective = models.ForeignKey(WaterproofPrObjectives, models.DO_NOTHING, db_column='id_objective')

    class Meta:
        managed = False
        db_table = 'waterproof_pr_parameter_objective'
        unique_together = (('id_parameter', 'id_objective'),)


class WaterproofPrParametro(models.Model):
    id_tipo_parametro = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    alias = models.CharField(max_length=100, blank=True, null=True)
    cut = models.BooleanField(blank=True, null=True)
    constant = models.BooleanField(blank=True, null=True)
    suffix = models.BooleanField(blank=True, null=True)
    empty = models.BooleanField(blank=True, null=True)
    file = models.BooleanField(blank=True, null=True)
    folder = models.BooleanField(blank=True, null=True)
    out_path = models.BooleanField(blank=True, null=True)
    calc = models.BooleanField(blank=True, null=True)
    inputuser = models.BooleanField(blank=True, null=True)
    biophysical_parameters = models.BooleanField(blank=True, null=True)
    from_preproc = models.BooleanField(blank=True, null=True)
    rios_type = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_pr_parametro'


class WaterproofPrParametroRuta(models.Model):
    id_parametro_ruta = models.AutoField(primary_key=True)
    id_basin = models.IntegerField()
    ruta = models.CharField(max_length=255, blank=True, null=True)
    id_parametro = models.ForeignKey(WaterproofPrParametro, models.DO_NOTHING, db_column='id_parametro')

    class Meta:
        managed = False
        db_table = 'waterproof_pr_parametro_ruta'


class WaterproofReportResultRoi(models.Model):
    id = models.AutoField()
    currency = models.CharField(max_length=4, blank=True, null=True)
    roi_without_discount = models.FloatField()
    roi_minimum = models.FloatField()
    roi_maximum = models.FloatField()
    roi_medium = models.FloatField()
    study_case_id = models.BigIntegerField(blank=True, null=True)
    create_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_report_result_roi'


class WaterproofReportsAnalysisBenefits(models.Model):
    id = models.AutoField()
    currency = models.CharField(max_length=4, blank=True, null=True)
    time = models.BigIntegerField(blank=True, null=True)
    benefit_value = models.FloatField(blank=True, null=True)
    element_id = models.IntegerField(blank=True, null=True)
    study_case_id = models.IntegerField(blank=True, null=True)
    creation_date = models.DateField(blank=True, null=True)
    type_id = models.CharField(max_length=10, blank=True, null=True)
    vpn_min_benefit = models.FloatField(blank=True, null=True)
    vpn_max_benefit = models.FloatField(blank=True, null=True)
    vpn_med_benefit = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_analysis_benefits'


class WaterproofReportsAnalysisCosts(models.Model):
    id = models.AutoField()
    currency = models.CharField(max_length=4, blank=True, null=True)
    time = models.BigIntegerField()
    value = models.FloatField()
    study_case_id = models.BigIntegerField(blank=True, null=True)
    cost_id = models.CharField(max_length=100, blank=True, null=True)
    date_create = models.DateField(blank=True, null=True)
    type = models.CharField(max_length=20, blank=True, null=True)
    vpn_min_cost = models.FloatField(blank=True, null=True)
    vpm_max_cost = models.FloatField(blank=True, null=True)
    vpn_med_cost = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_analysis_costs'


class WaterproofReportsAqueduct(models.Model):
    id = models.AutoField()
    intake_id = models.BigIntegerField(blank=True, null=True)
    aqueduct_indicators = models.CharField(max_length=60, blank=True, null=True)
    sigla = models.CharField(max_length=15, blank=True, null=True)
    value_ind = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_aqueduct'


class WaterproofReportsAqueductDescState(models.Model):
    id = models.AutoField()
    valuer = models.SmallIntegerField(blank=True, null=True)
    description = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_aqueduct_desc_state'


class WaterproofReportsAqueductIndicators(models.Model):
    id = models.AutoField()
    indicator = models.CharField(max_length=150, blank=True, null=True)
    initials = models.CharField(max_length=15, blank=True, null=True)
    description = models.CharField(max_length=100, blank=True, null=True)
    result_grouper = models.CharField(max_length=90, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_aqueduct_indicators'


class WaterproofReportsCalculatecostfunctionintakeBorrar(models.Model):
    stage = models.CharField(max_length=10)
    water_intake = models.IntegerField()
    element = models.IntegerField()
    year = models.IntegerField()
    value_calculate = models.FloatField(blank=True, null=True)
    cost_function = models.IntegerField()
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_calculatecostfunctionintake_borrar'


class WaterproofReportsCalculatecostfunctionptapBorrar(models.Model):
    stage = models.CharField(max_length=10)
    function_graph = models.IntegerField()
    year = models.IntegerField()
    value_calculate = models.FloatField(blank=True, null=True)
    cost_function = models.IntegerField()
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)
    function_plant_id = models.IntegerField()
    study_case_id = models.IntegerField()
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_calculatecostfunctionptap_borrar'


class WaterproofReportsInvestResults(models.Model):
    year = models.IntegerField()
    type = models.CharField(max_length=100)
    awy = models.FloatField(blank=True, null=True)
    wn_kg = models.FloatField(blank=True, null=True)
    wp_kg = models.FloatField(blank=True, null=True)
    wsed_ton = models.FloatField(blank=True, null=True)
    bf_m3 = models.FloatField(blank=True, null=True)
    wc_ton = models.FloatField(blank=True, null=True)
    execution_date = models.DateField()
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_invest_results'


class WaterproofReportsInvestindicators(models.Model):
    time = models.IntegerField()
    type = models.CharField(max_length=10)
    path = models.CharField(max_length=10)
    date = models.DateField()
    awy = models.FloatField(blank=True, null=True)
    wn_kg = models.FloatField(blank=True, null=True)
    wp_kg = models.FloatField(blank=True, null=True)
    wsed_ton = models.FloatField(blank=True, null=True)
    bf_m3 = models.FloatField(blank=True, null=True)
    wc_ton = models.FloatField(blank=True, null=True)
    intake_id = models.IntegerField()
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_investindicators'


class WaterproofReportsResultCostFunction(models.Model):
    stage = models.CharField(max_length=10)
    intake_id_plant_id = models.IntegerField()
    element_id = models.IntegerField()
    year = models.IntegerField()
    value_calculate = models.FloatField(blank=True, null=True)
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)
    study_case_id = models.IntegerField()
    user_id = models.IntegerField(blank=True, null=True)
    type_desc = models.CharField(max_length=10, blank=True, null=True)
    function_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_result_cost_function'


class WaterproofReportsRiosIpa(models.Model):
    year = models.IntegerField()
    sbn = models.CharField(max_length=100)
    actual_spent = models.FloatField(blank=True, null=True)
    total_budget = models.FloatField(blank=True, null=True)
    area_converted_ha = models.FloatField(blank=True, null=True)
    execution_date = models.DateField()
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING)
    study_case = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_rios_ipa'


class WaterproofReportsVpn(models.Model):
    id = models.AutoField()
    currency = models.CharField(max_length=4)
    implementation = models.FloatField()
    maintenance = models.FloatField()
    oportunity = models.FloatField()
    transaction = models.FloatField()
    platform = models.FloatField()
    benefit = models.FloatField()
    total = models.FloatField()
    study_case_id = models.BigIntegerField()
    date_execution = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_vpn'


class WaterproofReportsWbintake(models.Model):
    stage = models.CharField(max_length=10)
    water_intake = models.IntegerField()
    element = models.IntegerField()
    year = models.IntegerField()
    awy = models.FloatField(blank=True, null=True)
    q_l_s = models.FloatField(blank=True, null=True)
    cn_mg_l = models.FloatField(blank=True, null=True)
    cp_mg_l = models.FloatField(blank=True, null=True)
    csed_mg_l = models.FloatField(blank=True, null=True)
    wn_kg = models.FloatField(blank=True, null=True)
    wp_kg = models.FloatField(blank=True, null=True)
    wsed_ton = models.FloatField(blank=True, null=True)
    wn_ret_kg = models.FloatField(blank=True, null=True)
    wp_ret_ton = models.FloatField(blank=True, null=True)
    wsed_ret_ton = models.FloatField(blank=True, null=True)
    studycase = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_wbintake'


class WaterproofReportsWbptap(models.Model):
    stage = models.CharField(max_length=10)
    year = models.IntegerField()
    awy = models.FloatField(blank=True, null=True)
    cn_mg_l = models.FloatField(blank=True, null=True)
    cp_mg_l = models.FloatField(blank=True, null=True)
    csed_mg_l = models.FloatField(blank=True, null=True)
    wn_kg = models.FloatField(blank=True, null=True)
    wp_kg = models.FloatField(blank=True, null=True)
    wsed_ton = models.FloatField(blank=True, null=True)
    wn_ret_kg = models.FloatField(blank=True, null=True)
    wp_ret_kg_field = models.FloatField(db_column='wp_ret_kg_', blank=True, null=True)  # Field renamed because it ended with '_'.
    wsed_ret_ton = models.FloatField(blank=True, null=True)
    studycase = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING)
    user = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    element_id = models.IntegerField()
    ptap = models.ForeignKey('WaterproofTreatmentPlantsHeader', models.DO_NOTHING, blank=True, null=True)
    wp_ret_kg = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_reports_wbptap'


class WaterproofScBriefcase(models.Model):
    brf_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    dws_type_briefcase = models.CharField(max_length=150, blank=True, null=True)
    dws_value = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_briefcase'


class WaterproofScBriefcaseFullPercentages(models.Model):
    bfp_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    tac_id = models.IntegerField(blank=True, null=True)
    bpf_usr_create = models.IntegerField(blank=True, null=True)
    bpf_modif_date = models.DateTimeField(blank=True, null=True)
    bpf_valor = models.DecimalField(max_digits=2, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_briefcase_full_percentages'


class WaterproofScCasesResult(models.Model):
    dcr_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    dcr_analysis_type = models.CharField(db_column='dcr_analysis type', max_length=200, blank=True, null=True)  # Field renamed to remove unsuitable characters.
    dcr_variable_description_level1 = models.CharField(max_length=200, blank=True, null=True)
    dcr_variable_description_level2 = models.TextField(blank=True, null=True)
    dcr_variable_values = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'waterproof_sc_cases_result'


class WaterproofScConservationActivities(models.Model):
    cna_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    tac_id = models.IntegerField(blank=True, null=True)
    cna_usr_modf = models.IntegerField(blank=True, null=True)
    cna_modif_date = models.DateTimeField(blank=True, null=True)
    cna_value = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_conservation_activities'


class WaterproofScFinancialParameters(models.Model):
    fpr_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    fpr_description_nivel_1 = models.CharField(max_length=1000, blank=True, null=True)
    fpr_description_nivel_2 = models.CharField(max_length=1000, blank=True, null=True)
    fpr_description_nivel_3 = models.CharField(max_length=1000, blank=True, null=True)
    fpr_valor = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    fpr_usr_modf = models.IntegerField(blank=True, null=True)
    fpr_modif_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_financial_parameters'


class WaterproofScFunctionsCost(models.Model):
    fnc_id = models.AutoField(unique=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    fnc_name = models.CharField(max_length=1000, blank=True, null=True)
    fnc_formula = models.CharField(max_length=1000, blank=True, null=True)
    fnc_conditional = models.CharField(max_length=1000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_functions_cost'


class WaterproofScInvestmentScenario(models.Model):
    ivs_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    tac_id = models.IntegerField(blank=True, null=True)
    ivs_usr_create = models.IntegerField(blank=True, null=True)
    ivs_modif_date = models.DateTimeField(blank=True, null=True)
    ivs_valor = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_investment_scenario'


class WaterproofScModelingParameters(models.Model):
    mdp_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    tbmdi_id = models.IntegerField(blank=True, null=True)
    cmi_id = models.IntegerField(blank=True, null=True)
    variable_value = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_modeling_parameters'


class WaterproofScTreatmentPlant(models.Model):
    trp_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    ttp = models.ForeignKey('TblTreatmentPlant', models.DO_NOTHING, blank=True, null=True)
    trp_modif_date = models.DateTimeField(blank=True, null=True)
    trp_usr_modf = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_treatment_plant'


class WaterproofScWiAdd(models.Model):
    add_id = models.AutoField(primary_key=True)
    dws = models.ForeignKey('WaterproofStudyCases', models.DO_NOTHING, blank=True, null=True)
    wti = models.ForeignKey('TblWaterIntakes', models.DO_NOTHING, blank=True, null=True)
    add_usr_modf = models.IntegerField(blank=True, null=True)
    add_modif_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_sc_wi_add'


class WaterproofStudyCasesCurrencyCostCalculated(models.Model):
    id = models.AutoField(blank=True, null=True)
    type_or_id = models.CharField(max_length=100, blank=True, null=True)
    cost = models.CharField(max_length=100, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=100, blank=True, null=True)
    studycase = models.ForeignKey('WaterproofStudyCasesStudycases', models.DO_NOTHING, blank=True, null=True)
    date_execution = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_currency_cost_calculated'


class WaterproofStudyCasesModelparameter(models.Model):
    description = models.CharField(max_length=500)
    lucode = models.IntegerField()
    lulc_veg = models.BooleanField(blank=True, null=True)
    root_depth = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    kc = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_modelparameter'


class WaterproofStudyCasesPortfolio(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500, blank=True, null=True)
    default = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_portfolio'


class WaterproofStudyCasesStudycases(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    studycase_type = models.CharField(max_length=20, blank=True, null=True)
    program_director = models.DecimalField(db_column='program_Director', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    implementation_manager = models.DecimalField(db_column='implementation_Manager', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    monitoring_manager = models.DecimalField(db_column='monitoring_Manager', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    finance_manager = models.DecimalField(db_column='finance_Manager', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    administrative_assistant = models.DecimalField(db_column='administrative_Assistant', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    office_costs = models.DecimalField(db_column='office_Costs', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    overhead = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    equipment_purchased = models.DecimalField(db_column='equipment_Purchased', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    vehicles_purchased = models.DecimalField(db_column='vehicles_Purchased', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    equipment_maintenance = models.DecimalField(db_column='equipment_Maintenance', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    vehicle_maintenance = models.DecimalField(db_column='vehicle_Maintenance', max_digits=20, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    discount_rate_maximum = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    discount_rate_minimunm = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    transaction_cost = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    others = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    travel = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    contracts = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    analysis_type = models.CharField(max_length=20, blank=True, null=True)
    analysis_period_value = models.IntegerField(blank=True, null=True)
    analysis_currency = models.CharField(max_length=4, blank=True, null=True)
    is_complete = models.BooleanField()
    create_date = models.DateTimeField(blank=True, null=True)
    edit_date = models.DateTimeField(blank=True, null=True)
    time_implement = models.IntegerField(blank=True, null=True)
    annual_investment = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    benefit_carbon_market = models.BooleanField(blank=True, null=True)
    rellocated_remainder = models.BooleanField(blank=True, null=True)
    financial_currency = models.CharField(max_length=4, blank=True, null=True)
    cm_currency = models.CharField(max_length=4, blank=True, null=True)
    cm_value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    added_by = models.ForeignKey(PeopleProfile, models.DO_NOTHING, blank=True, null=True)
    city = models.ForeignKey(WaterproofParametersCities, models.DO_NOTHING)
    climate_scenario = models.ForeignKey(WaterproofParametersClimateValue, models.DO_NOTHING, blank=True, null=True)
    is_run_analysis = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases'


class WaterproofStudyCasesStudycasesCurrency(models.Model):
    currency = models.CharField(max_length=4, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=15, blank=True, null=True)
    studycase = models.ForeignKey(WaterproofStudyCasesStudycases, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases_currency'


class WaterproofStudyCasesStudycasesIntakes(models.Model):
    studycases = models.ForeignKey(WaterproofStudyCasesStudycases, models.DO_NOTHING)
    intake = models.ForeignKey(WaterproofIntakeIntake, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases_intakes'
        unique_together = (('studycases', 'intake'),)


class WaterproofStudyCasesStudycasesNbs(models.Model):
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    nbs = models.ForeignKey(WaterproofNbsCaWaterproofnbsca, models.DO_NOTHING)
    studycase = models.ForeignKey(WaterproofStudyCasesStudycases, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases_nbs'


class WaterproofStudyCasesStudycasesPortfolios(models.Model):
    studycases = models.ForeignKey(WaterproofStudyCasesStudycases, models.DO_NOTHING)
    portfolio = models.ForeignKey(WaterproofStudyCasesPortfolio, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases_portfolios'
        unique_together = (('studycases', 'portfolio'),)


class WaterproofStudyCasesStudycasesPtaps(models.Model):
    studycases = models.ForeignKey(WaterproofStudyCasesStudycases, models.DO_NOTHING)
    header = models.ForeignKey('WaterproofTreatmentPlantsHeader', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'waterproof_study_cases_studycases_ptaps'
        unique_together = (('studycases', 'header'),)


class WaterproofTreatmentPlantsCsinfra(models.Model):
    csinfra_plant = models.ForeignKey('WaterproofTreatmentPlantsHeader', models.DO_NOTHING, blank=True, null=True)
    csinfra_user = models.TextField(blank=True, null=True)
    csinfra_date_create = models.DateTimeField(blank=True, null=True)
    csinfra_date_update = models.DateTimeField(blank=True, null=True)
    csinfra_elementsystem_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_treatment_plants_csinfra'


class WaterproofTreatmentPlantsElement(models.Model):
    element_normalize_category = models.TextField(blank=True, null=True)
    element_plant = models.ForeignKey('WaterproofTreatmentPlantsHeader', models.DO_NOTHING, blank=True, null=True)
    element_graph_id = models.IntegerField(blank=True, null=True)
    element_on_off = models.BooleanField(blank=True, null=True)
    element_q_l = models.FloatField(blank=True, null=True)
    element_awy = models.FloatField(blank=True, null=True)
    element_cn_mg_l = models.FloatField(blank=True, null=True)
    element_cp_mg_l = models.FloatField(blank=True, null=True)
    element_csed_mg_l = models.FloatField(blank=True, null=True)
    element_wn_kg = models.FloatField(blank=True, null=True)
    element_wn_rent_kg = models.FloatField(blank=True, null=True)
    element_wp_rent_ton = models.FloatField(blank=True, null=True)
    element_wsed_tom = models.FloatField(blank=True, null=True)
    element_wp_kg = models.FloatField(blank=True, null=True)
    element_user = models.TextField(blank=True, null=True)
    element_date_create = models.DateTimeField(blank=True, null=True)
    element_date_update = models.DateTimeField(blank=True, null=True)
    element_wsed_ret_ton = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_treatment_plants_element'


class WaterproofTreatmentPlantsFunction(models.Model):
    function_name = models.TextField(blank=True, null=True)
    function_value = models.TextField(blank=True, null=True)
    function_currency = models.TextField(blank=True, null=True)
    function_factor = models.TextField(blank=True, null=True)
    function_id_sub_process = models.IntegerField(blank=True, null=True)
    function_user = models.TextField(blank=True, null=True)
    function_date_create = models.DateTimeField(blank=True, null=True)
    function_date_update = models.DateTimeField(blank=True, null=True)
    function_plant = models.ForeignKey('WaterproofTreatmentPlantsHeader', models.DO_NOTHING, blank=True, null=True)
    function_transported_water = models.TextField(blank=True, null=True)
    function_sediments_retained = models.TextField(blank=True, null=True)
    function_nitrogen_retained = models.TextField(blank=True, null=True)
    function_phosphorus_retained = models.TextField(blank=True, null=True)
    function_technology = models.TextField(blank=True, null=True)
    function_graph_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_treatment_plants_function'


class WaterproofTreatmentPlantsHeader(models.Model):
    plant_name = models.CharField(max_length=100, blank=True, null=True)
    plant_description = models.CharField(max_length=300, blank=True, null=True)
    plant_suggest = models.CharField(max_length=1, blank=True, null=True)
    plant_user = models.TextField(blank=True, null=True)
    plant_date_create = models.DateTimeField(blank=True, null=True)
    plant_date_update = models.DateTimeField(blank=True, null=True)
    plant_city = models.ForeignKey(WaterproofParametersCities, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_treatment_plants_header'


class WaterproofTreatmentPlantsPtap(models.Model):
    ptap_plant = models.ForeignKey(WaterproofTreatmentPlantsHeader, models.DO_NOTHING, blank=True, null=True)
    ptap_type = models.TextField(blank=True, null=True)
    ptap_awy = models.FloatField(blank=True, null=True)
    ptap_cn = models.FloatField(blank=True, null=True)
    ptap_cp = models.FloatField(blank=True, null=True)
    ptap_cs = models.FloatField(blank=True, null=True)
    ptap_wn = models.FloatField(blank=True, null=True)
    ptap_wp = models.FloatField(blank=True, null=True)
    ptap_ws = models.FloatField(blank=True, null=True)
    ptap_date_create = models.DateTimeField(blank=True, null=True)
    ptap_user = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'waterproof_treatment_plants_ptap'
