from setuptools import setup, find_packages

setup(
    name='Connectr',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask',
        'flask-login',
        'sqlalchemy',
    ],
)
