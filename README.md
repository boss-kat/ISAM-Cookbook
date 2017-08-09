# IBM Mobile multi Factor Authentication Demo Ansible Code

This repository contains a sample Playbook for building ISAM MMFA Cookbook environment. This playbook was tested with ISAM v9.0.2.1 and ISAM v9.0.3 software.

For ISAM MMFA Cookbook details please refer to https://www.ibm.com/developerworks/community/wikis/home?lang=en#!/wiki/IBM%20Security%20Federated%20Identity%20Manager/page/IBM%20Verify%20Cookbook . This playbook implements cookbook chapters from 1 - 19.

This demo uses Ansible ISAM Roles, which in turn uses "ibmsecurity" python package.

## Demo Requirements

Python v2.7.10 and above is required for this package.

The following Python Packages are required (including their dependencies):
1. ibmsecurity
2. ansible

ISAM Roles need to be installed and available.

This playbook is able to create ISAM appliance on the MAC OS VMWare Fusion platform. 
For other platforms or virtualization environments it is required that appliance will have an ip address defined for LMI. This may mean that appliances have had their initial setup done with license acceptance.

To eliminate appliance VM creation at the playbook running please comment the "- include: common/create_vm.yaml" line in the mmfademo.yml file.

If you have a Docker environment you may also download the isam-ansible docker image which takes care of all the pre-requisites, details please refer to  https://hub.docker.com/r/mludocker/isam-ansible/ .

This demo environment is using three (3) NICs. One NAT interface for LMI with subnet 172.16.163.0, one NAT interface for AAC runtime with subnet 172.16.222.0 and one bridged interface for the external access with 192.168.0.0. You will need configure three NICs on your virtual environment and update subnet configuration accodring to your subnet IPs. For virtual network configuration details please refer to attached mmfa_network_config.pdf file.

# Get Started on MAC OS with VMWare Fusion.
### 1. Install xcode from AppStore

### 2. Install Xcode command line tools
xcode-select --install

### 3. Install ansible
brew install ansible

### 4. Install pre-requisites
pip install requests
pip install importlib
pip install PyYAML

### 5. Create Ansible folder in user's home directory
mkdir ~/Ansible
In case you need to place the project into different folder on, it is required to update the following parameter in the playbook:

ansible_root_path: "/opt/IBM/Ansible"

### 6. Download and unzip ibmsecurity from GITHUB
cd ~/Ansible
curl -L https://github.com/IBM-Security/ibmsecurity/archive/master.zip | tar xz

### 7. Install ibmsecurity python package
cd ~/Ansible/ibmsecurity-master
python setup.py install

### 8. Install ansible roles
ansible-galaxy install git+https://github.com/ibm-security/isam-ansible-roles.git --roles-path ~/Ansible

### 9. Download and extract MMFA Cookbook ansible project to a temp folder.
cd /tmp
curl -L https://github.com/boss-kat/ISAM-Cookbook/archive/master.zip | tar xz

### 10. Move the project to ~/Ansible 
cd /tmp/ISAM-Cookbook-master
mv * ~/Ansible

### 11. Update Ansible/ansible.cfg only if Ansible project was NOT installed into user's home directory
[defaults]
#If Ansible folder is NOT under user's home directory specify full path to role_path folder
roles_path				= ~/Ansible/isam-ansible-roles
#roles_path				= /opt/IBM/Ansible/isam-ansible-roles
#If Ansible folder is NOT under user's home directory specify full path to retry_files_save_path folder
retry_files_save_path 	= ~/Ansible/Playbooks/retry
#retry_files_save_path 	= /opt/IBM/Ansible/Playbooks/retry

### 12. Configure ansible root path in <environment>/group_vars/all/vars.yml only if Ansible root folder not in the user's home directory
#Ansible root path
#If Ansible folder is NOT under user's home directory specify full path to Ansible folder
#ansible_root_path: "/opt/IBM/Ansible/"
ansible_root_path: "{{ lookup('env','HOME') }}/Ansible"

### 13. Update network subnet with actual subnect IPs in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
#Subnet configuration
ipv4_1_1_ip_net: 172.16.163
ipv4_1_2_ip_net: 172.16.222
ipv4_1_3_ip_net: 192.168.0

### 14. Update host entries configuration according to your network config in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
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

### 15. Update /etc/hosts file on the MAC host with demo host IPs
sudo vi /etc/hosts
#MMFA Demo Hosts
172.16.163.103  isam.mmfa.ibm.com
172.16.163.104  www.mmfa.ibm.com
192.168.0.150   mobile.mmfa.ibm.com
172.16.222.103  aac.mmfa.ibm.com

### 16. Download ISAM iso file, ISAM fixpack, Base activation code and AAC activation code from Passport Advantage into ~/Ansible/Products/SAM directory. The file names for the downloaded software can be updated in the ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml config:
#ISAM ISO file
isam_iso: "SAM/SAM_9030_BASE_VA_ISO_ML.iso"
#ISAM fixpack file
isam_fixpack: "SAM/9030_IF2.fixpack"
#ISAM WGA Activation code file name
wga_activation_file: "SAM/SAM_9030_ACT_ML.txt"
#ISAM Advanced Access Activation code file name
aac_activation_file: "SAM/SAM_9030_ADV_ACC_CTL_ACT_ML.txt"

NOTE: You can decrease deployment time by not installing the fixpack. Just comment the following line:
#isam_fixpack: "SAM/9030_IF2.fixpack"

### 17. Run the playbook with the following command:
cd ~/Ansible
ansible-playbook -i Playbooks/inventories/mmfademo Playbooks/mmfademo.yml



# Get Started on RedHat 7.3.
Please configure VM with three NICs as per attached mmfa_network_config.pdf file. You can use the following silent installation procedure to create VM https://www.ibm.com/support/knowledgecenter/en/SSPREK_9.0.3/com.ibm.isam.doc/admin/concept/con_virtual_appl_tasks.html.

### 1. Create ansible user
useradd -g root ansible
passwd ansible
cd /home
mkdir ansible
chown ansible ansible

### 2. Install Extra Packages for Enterprise Linux
Ansible is not available in the default RHEL repositories, so we need to install Extra Packages for Enterprise Linux (EPEL) in order to install it via yum. 

Download epel-release-latest-7.noarch.rpm
curl -L https://archive.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm -o epel-release-latest-7.noarch.rpm

Install epel-release-latest-7.noarch.rpm
rpm -ivh epel-release-latest-7.noarch.rpm

### 3. Update RedHat
yum update

### 4. Install Ansible and python-jmespath
yum install ansible
yum install python-jmespath

### 5. Create Ansible project folder
su - ansible
mkdir Ansible
In case you need to place the project into different folder on, it is required to update the following parameter in the playbook:
ansible_root_path: "/opt/IBM/Ansible"

### 6. Download and unzip ibmsecurity from GITHUB
cd ~/Ansible
curl -L https://github.com/IBM-Security/ibmsecurity/archive/master.zip | tar xz

### 7. Install ibmsecurity python package
cd ~/Ansible/ibmsecurity-master
python setup.py install

### 8. Install ansible roles
ansible-galaxy install git+https://github.com/ibm-security/isam-ansible-roles.git --roles-path ~/Ansible

### 9. Download and extract MMFA Cookbook ansible project to a temp folder.
cd /tmp
curl -L https://github.com/boss-kat/ISAM-Cookbook/archive/master.zip | tar xz

### 10. Move the project to ~/Ansible 
cd /tmp/ISAM-Cookbook-master
mv * ~/Ansible

### 11. Update Ansible/ansible.cfg only if Ansible project was NOT installed into user's home directory
[defaults]
#If Ansible folder is NOT under user's home directory specify full path to role_path folder
roles_path				= ~/Ansible/isam-ansible-roles
#roles_path				= /opt/IBM/Ansible/isam-ansible-roles
#If Ansible folder is NOT under user's home directory specify full path to retry_files_save_path folder
retry_files_save_path 	= ~/Ansible/Playbooks/retry
#retry_files_save_path 	= /opt/IBM/Ansible/Playbooks/retry

### 12. Configure ansible root path in <environment>/group_vars/all/vars.yml only if Ansible root folder not in the user's home directory
#Ansible root path
#If Ansible folder is NOT under user's home directory specify full path to Ansible folder
#ansible_root_path: "/opt/IBM/Ansible/"
ansible_root_path: "{{ lookup('env','HOME') }}/Ansible"

### 13. Update network subnet with actual subnect IPs in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
#Subnet configuration
ipv4_1_1_ip_net: 172.16.163
ipv4_1_2_ip_net: 172.16.222
ipv4_1_3_ip_net: 192.168.0

### 14. Update host entries configuration according to your network config in ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml
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

### 15. Update /etc/hosts file on the RedHat host with demo host IPs
sudo vi /etc/hosts
#MMFA Demo Hosts
172.16.163.103  isam.mmfa.ibm.com
172.16.163.104  www.mmfa.ibm.com
192.168.0.150   mobile.mmfa.ibm.com
172.16.222.103  aac.mmfa.ibm.com

### 16. Download ISAM iso file, ISAM fixpack, Base activation code and AAC activation code from Passport Advantage into ~/Ansible/Products/SAM directory. The file names for the downloaded software can be updated in the ~/Ansible/Playbooks/inventories/mmfademo/group_vars/all/vars.yml config:
#ISAM ISO file
isam_iso: "SAM/SAM_9030_BASE_VA_ISO_ML.iso"
#ISAM fixpack file
isam_fixpack: "SAM/9030_IF2.fixpack"
#ISAM WGA Activation code file name
wga_activation_file: "SAM/SAM_9030_ACT_ML.txt"
#ISAM Advanced Access Activation code file name
aac_activation_file: "SAM/SAM_9030_ADV_ACC_CTL_ACT_ML.txt"

NOTE: You can decrease deployment time by not installing the fixpack. Just comment the following line:
#isam_fixpack: "SAM/9030_IF2.fixpack"

### 17. Disable automatic VM creation in the /~/Ansible/ISAM-Cookbook/Playbooks/mmfademo.yml file
#- include: common/create_vm.yaml

### 18. Run the playbook with the following command:
cd ~/Ansible
ansible-playbook -i Playbooks/inventories/mmfademo Playbooks/mmfademo.yml


# MMFA Demo access and scenarios

### 1. Access the MMFA Device configuration page 
https://www.mmfa.ibm.com/mga/sps/mmfa/user/mgmt/html/mmfa/usc/manage.html

At this page you can add your iOS or Android smartphone as a mobile device. You can also use U2F keys with this demo. 

### 2. Access context based authorization page 
https://www.mmfa.ibm.com/app/mobile-demo/payload/

The transfer amount less than 1000$ does not require mobile approval. 1000$+ amounts requires mobile approval.

For the demo scenarios please refer to MMFA Cookbook. 



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
