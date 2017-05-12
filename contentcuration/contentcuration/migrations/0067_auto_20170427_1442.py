# -*- coding: utf-8 -*-
# Generated by Django 1.9.12 on 2017-04-27 21:42
from __future__ import unicode_literals

import contentcuration.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contentcuration', '0066_auto_20170412_0015'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contentnode',
            name='original_source_node_id',
            field=contentcuration.models.UUIDField(db_index=True, editable=False, max_length=32, null=True),
        ),
    ]