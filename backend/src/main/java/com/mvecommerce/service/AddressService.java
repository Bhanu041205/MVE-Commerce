package com.mvecommerce.service;

import com.mvecommerce.dto.AddressDTO;
import com.mvecommerce.entity.Address;
import com.mvecommerce.entity.User;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.AddressRepository;
import com.mvecommerce.repository.UserRepository;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final ModelMapper modelMapper;

    public AddressDTO createAddress(AddressDTO addressDTO) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(addressDTO.getIsDefault())) {
            // Set all other addresses to non-default
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            for (Address addr : userAddresses) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }

        Address address = Address.builder()
                .user(user)
                .addressLine1(addressDTO.getAddressLine1())
                .addressLine2(addressDTO.getAddressLine2())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .postalCode(addressDTO.getPostalCode())
                .country(addressDTO.getCountry())
                .phone(addressDTO.getPhone())
                .isDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false)
                .build();

        Address savedAddress = addressRepository.save(address);
        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Transactional(readOnly = true)
    public List<AddressDTO> getUserAddresses() {
        Long userId = securityUtil.getCurrentUserId();
        return addressRepository.findByUserId(userId)
                .stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressDTO getAddressById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        return modelMapper.map(address, AddressDTO.class);
    }

    public AddressDTO updateAddress(Long id, AddressDTO addressDTO) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        if (Boolean.TRUE.equals(addressDTO.getIsDefault())) {
            // Set all other addresses to non-default
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            for (Address addr : userAddresses) {
                if (!addr.getId().equals(id)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            }
        }

        address.setAddressLine1(addressDTO.getAddressLine1() != null ? addressDTO.getAddressLine1() : address.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2() != null ? addressDTO.getAddressLine2() : address.getAddressLine2());
        address.setCity(addressDTO.getCity() != null ? addressDTO.getCity() : address.getCity());
        address.setState(addressDTO.getState() != null ? addressDTO.getState() : address.getState());
        address.setPostalCode(addressDTO.getPostalCode() != null ? addressDTO.getPostalCode() : address.getPostalCode());
        address.setCountry(addressDTO.getCountry() != null ? addressDTO.getCountry() : address.getCountry());
        address.setPhone(addressDTO.getPhone() != null ? addressDTO.getPhone() : address.getPhone());
        address.setIsDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : address.getIsDefault());

        Address updatedAddress = addressRepository.save(address);
        return modelMapper.map(updatedAddress, AddressDTO.class);
    }

    public void deleteAddress(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        addressRepository.delete(address);
    }
}
