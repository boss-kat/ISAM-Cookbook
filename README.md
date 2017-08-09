# IBM Sample Code

This repository contains a sample Playbook for builing ISAM MMFA Cookbook environment. The playbook was tested with ISAM v9.0.2.1 and ISAM v9.0.3 software.

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

To eliminate appliance VM creation at the playbook running please comment the "- include: common/create_vm.yaml" line in the mmfademo.yml file.

If you have a Docker environment you may also download the isam-ansible docker image which takes care of all the pre-requisites, details please refer to  https://hub.docker.com/r/mludocker/isam-ansible/ .

This demo environment is using three (3) NICs. One NAT interface for LMI with subnet 172.16.163.0, one NAT interface for AAC runtime with subnet 172.16.222.0 and one bridged interface for the external access with 192.168.0.0. You will need configure three NICs on your virtual environment and update subnet configuration accodring to your subnet IPs. For virtual network configuration details please refer to attached mmfa_network_config.pdf file.

## Get Started on MAC OS with VMWare Fusion.
### 1. Install xcode from AppStore

### 2. Install Xcode command line tools
xcode-select --install

###3. Install ansible
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

9. Download and extract MMFA Cookbook ansible project to a temp folder.
cd /tmp
curl -L https://github.com/boss-kat/ISAM-Cookbook/archive/master.zip | tar xz

10. Move the project to ~/Ansible 
cd /tmp/ISAM-Cookbook-master
mv * ~/Ansible

11. Update Ansible/ansible.cfg only if Ansible project was NOT installed into user's home directory
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

13. Update network subnet with actual subnect IPs in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
# Subnet configuration
ipv4_1_1_ip_net: 172.16.163
ipv4_1_2_ip_net: 172.16.222
ipv4_1_3_ip_net: 192.168.0

14. Update host entries configuration according to your network config in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
appl_hostnames:
 - addr: "{{ipv4_1_1_ip_net}}.103"
   hostnames:
    - {name: isam.mmfa.ibm.com}
 - addr: "{{ipv4_1_1_ip_net}}.104"
   hostnames:
    - {name: www.mmfa.ibm.com} 
 - addr: "{{ipv4_1_3_ip_net}}.150"
   hostnames:
    - {name: mobile.mmfa.ibm.com} 
 - addr: "{{ipv4_1_2_ip_net}}.103"
   hostnames:
    - {name: aac.mmfa.ibm.com}

15. Update /etc/hosts file on the MAC host with demo host IPs
sudo vi /etc/hosts
#MMFA Demo Hosts
172.16.163.103  isam.mmfa.ibm.com
172.16.163.104  www.mmfa.ibm.com
192.168.0.150   mobile.mmfa.ibm.com
172.16.222.103  aac.mmfa.ibm.com

16. Download ISAM iso file, ISAM fixpack, Base activation code and AAC activation code from Passport Advantage into ~/Ansible/Products/SAM directory. The file names for the downloaded software can be updated in the ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml config:
# ISAM ISO file
isam_iso: "SAM/SAM_9030_BASE_VA_ISO_ML.iso"
# ISAM fixpack file
isam_fixpack: "SAM/9030_IF2.fixpack"
#ISAM WGA Activation code file name
wga_activation_file: "SAM/SAM_9030_ACT_ML.txt"
#ISAM Advanced Access Activation code file name
aac_activation_file: "SAM/SAM_9030_ADV_ACC_CTL_ACT_ML.txt"

NOTE: You can decrease deployment time by not installing the fixpack. Just comment the following line:
#isam_fixpack: "SAM/9030_IF2.fixpack"

14. Run the playbook with the following command:
cd ~/Ansible
ansible-playbook -i Playbooks/inventories/mmfademo Playbooks/mmfademo.yml


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
