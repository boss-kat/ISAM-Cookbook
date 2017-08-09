# IBM Sample Code

This repository contains a sample Playbook for builing ISAM MMFA Cookbook environment. 

For ISAM MMFA Cookbook details please refer to https://www.ibm.com/developerworks/community/wikis/home?lang=en#!/wiki/IBM%20Security%20Federated%20Identity%20Manager/page/IBM%20Verify%20Cookbook . 

It uses Ansible ISAM Roles, which in turn uses "ibmsecurity" python package.

## Requirements

Python v2.7.10 and above is required for this package.

The following Python Packages are required (including their dependencies):
1. ibmsecurity
2. ansible

ISAM Roles need to be installed and available.

The playbook is able to create ISAM appliance on the VMWare Fusion platform. For other platforms it is required that appliance will have an ip address defined for their LMI. This may mean that appliances have had their initial setup 
done with license acceptance.

To eliminate appliance creation at the playbook running please comment the "- include: common/create_vm.yaml" line in the mmfademo.yml file.

If you have a Docker environment you may also download the isam-ansible docker image which takes care of all the pre-requisites, details please refer to  https://hub.docker.com/r/mludocker/isam-ansible/ .


## Get Started on MAC OS with VMWare Fusion.
1. Install xcode from AppStore

2. Install Xcode command line tools
xcode-select --install

3. Install ansible
brew install ansible

4. Install pre-requisites
pip install requests
pip install importlib
pip install PyYAML

5. Create Ansible folder in user's home directory
mkdir ~/Ansible
In case you need to put the project into different folder on MAC, it is required update the following parameter in the playbook:
ansible_root_path: "/tmp/Ansible"

5. Download and unzip ibmsecurity from GITHUB
cd ~/Ansible
curl -L https://github.com/IBM-Security/ibmsecurity/archive/master.zip | tar xz

6. Install ibmsecurity python package
cd ~/Ansible/ibmsecurity-master
python setup.py install

8. Install ansible roles
ansible-galaxy install git+https://github.com/ibm-security/isam-ansible-roles.git --roles-path ~/Ansible

9. Download MMFA Cookbook ansible project to temp.
ansible-galaxy install git+https://github.com/IBM-Security/isam-ansible-playbook-sample.git --roles-path ~/Ansible

10. Update /etc/hosts file with demo host entries
172.16.163.103  isam.mmfa.ibm.com
192.168.0.200   www.mmfa.ibm.com
172.16.163.101  isam.myidp.ibm.com
172.16.163.102  www.myidp.ibm.com
172.16.163.201  isam.mysp.ibm.com
172.16.163.202  www.mysp.ibm.com


11. Update Ansible/ansible.cfg only if Ansible was installed not into user's home directory
[defaults]
# If Ansible folder is NOT under user's home directory specify full path to role_path folder
roles_path				= ~/Ansible/isam-ansible-roles
#roles_path				= /opt/IBM/Ansible/isam-ansible-roles
# If Ansible folder is NOT under user's home directory specify full path to retry_files_save_path folder
retry_files_save_path 	= ~/Ansible/Playbooks/retry
#retry_files_save_path 	= /opt/IBM/Ansible/Playbooks/retry

12. Configure ansible root path in <environment>/group_vars/all/vars.yml only if Ansible root folder not in the user's home directory
# Ansible root path
# If Ansible folder is NOT under user's home directory specify full path to Ansible folder
#ansible_root_path: "/opt/IBM/Ansible/"
ansible_root_path: "{{ lookup('env','HOME') }}/Ansible"

13. Update subnet with actual IP in <environment>/group_vars/all/vars.yml
# Demo subnet 
ipv4_1_1_ip_net: 172.16.163
ipv4_1_2_ip_net: 172.16.222

14. Run the playbook with the following commands:
For SAML demo:
ansible-playbook -i Playbooks/inventories/federationdemo Playbooks/samldemo.yml
For OIDC demo
ansible-playbook -i Playbooks/inventories/federationdemo Playbooks/oidcdemo.yml
For MMFA Demo
ansible-playbook -i Playbooks/inventories/mmfademo Playbooks/mmfademo.yml





Clone this repository to get started, like so:
`git clone https://github.com/ibm-security/isam-ansible-playbook-sample.git`

## Features

### Test Inventory
The playbook contains a static inventory file describing two appliances in a data center in Boulder. The appliance ip 
addresses are used to identify them to avoid dependency on DNS or host entries. Passwords are stored in a "vault.yml" - 
these would ideally be encrypted, but that step has been skipped to allow for demonstration purposes.

### Playbooks

#### Install Firmware
This playbook can be used as is to install firmware packages into appliances. It will work out--of-box. Use like so:

`ansible-playbook -i inventories/test install_firmware.yml -e "install_firmware_file=/home/python/isam_9.0.2.1_20170116-1957.pkg install_firmware_version=9.0.2.1 install_firmware_release_date=2017-01-16"`

#### Install Fixpack
This playbook can be used as is to install fixpacks into appliances. It will work out--of-box. Use like so:

`ansible-playbook -i inventories/test install_firmware.yml -e "install_fixpack_file='/home/python/9021_IF1.fixpack'"`

#### Execute PDAdmin commands
This playbook can be used as is to execute PDAdmin commands provided in a file against appliances. It will work out--of-box.

`ansible-playbook -i inventories/test pdadmin.yml -e "pdadmin_file='/home/python/test.pdadmin'"`

You may want to use the `--limit` command to restrict the execution of the PDAdmin commands against more than one appliance.
The playbook excludes appliances that are part of `restricted` group.

#### Compare
This playbook will take appliances provided in the current inventory and run compares against a "master" appliance. This
master can be in the same inventory or not. The playbook can be customized to limit the features compared. By default it
will try to compare all features found on the master appliance. Look at the default/main.yml of `execute_compare` role for 
values that can be overridden. This will work out-of-box. Use like so:

`ansible-playbook -i inventories/test compare.yml --limit 192.168.198.145 -e "master_hostname=192.168.198.153"`

It will prompt for the password for `admin` account of the master appliance.

#### Change Passwords
Appliances come with certain userids that may need to be changed from default. These are:
admin - root user to login to appliance
cn=root,SecAuthority=Default - root user for Embedded LDAP
easuser - BA User (created when mga or federation modules are activated)
sec_master - Assigned when web runtime (policy server) is configured

This playbook provides guidance on how these passwords can be changed. This can be done either one time or ever so often
as dictated by corporate policy.

#### Revert
In case there is a need to revert appliances back to an original state - in the absence of snapshots or the snapshot cannot
be used because of a mis-match of firmware levels - then use this playbook to deactivate the activated modules. Other
configuration to base features may still need to be undone. Use like so:

`ansible-playbook -i inventories/test revert.yml`

#### Site
This is the standard playbook to be used to build out an environment. Use this as a template to describe and build 
your environment.

`ansible-playbook -i inventories/test site.yml`

# License

The contents of this repository are open-source under the Apache 2.0 licence.

```
Copyright 2017 International Business Machines

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Ansible is a trademark of Red Hat, Inc.
