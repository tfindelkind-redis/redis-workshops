#!/usr/bin/env python3
"""
Generate the complete implement-caching-lab.ipynb notebook
"""
import json

def create_markdown_cell(content):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": content if isinstance(content, list) else [content]
    }

def create_code_cell(content):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": content if isinstance(content, list) else [content]
    }

cells = []

# Title
cells.append(create_markdown_cell([
    "# 🚀 Implement Caching Lab - Interactive Edition\n",
    "\n",
    "**Duration:** 45-60 minutes\n",
    "**Level:** Intermediate\n",
    "\n",
    "In this lab you'll implement Redis caching with real performance measurements!"
]))

# Imports
cells.append(create_markdown_cell("## Part 1: Setup"))
cells.append(create_code_cell([
    "import redis\n",
    "import time\n",
    "import json\n",
    "import matplotlib.pyplot as plt\n",
    "import pandas as pd\n",
    "\n",
    "%matplotlib inline\n",
    "print('✅ Imports complete!')"
]))

# Add more cells here...

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python (Redis Workshop)",
            "language": "python",
            "name": "redis-workshop"
        },
        "language_info": {
            "name": "python",
            "version": "3.11.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

output_path = "workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/implement-caching-lab.ipynb"
with open(output_path, 'w') as f:
    json.dump(notebook, f, indent=1)

print(f"✅ Created notebook: {output_path}")
